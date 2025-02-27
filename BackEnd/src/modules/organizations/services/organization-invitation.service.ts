import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { Organization } from '../entities/organization.entity';
import { OrganizationInvitation } from '../entities/organization-invitation.entity';
import { User } from '../../users/entities/user.entity';
import { EmailService } from '../../../shared/services/email.service';
import { OrganizationSubscriptionService } from './organization-subscription.service';

@Injectable()
export class OrganizationInvitationService {
    private readonly logger = new Logger(OrganizationInvitationService.name);

    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(OrganizationInvitation)
        private readonly invitationRepository: Repository<OrganizationInvitation>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly emailService: EmailService,
        private readonly subscriptionService: OrganizationSubscriptionService,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async createInvitation(
        organizationId: string,
        email: string,
        role: string,
        invitedBy: string
    ): Promise<OrganizationInvitation> {
        try {
            // Check organization exists
            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            // Check subscription limits
            const { allowed, limit, current } = await this.subscriptionService.checkResourceLimit(
                organizationId,
                'users'
            );

            if (!allowed) {
                throw new Error(
                    `Organization has reached member limit (${current}/${limit})`
                );
            }

            // Check if user is already a member
            const existingMember = await this.userRepository.findOne({
                where: { email, organizations: { id: organizationId } }
            });

            if (existingMember) {
                throw new Error(`User ${email} is already a member of the organization`);
            }

            // Check for existing pending invitation
            const existingInvitation = await this.invitationRepository.findOne({
                where: {
                    organizationId,
                    email,
                    status: 'pending'
                }
            });

            if (existingInvitation) {
                throw new Error(`Pending invitation already exists for ${email}`);
            }

            // Create new invitation
            const invitation = this.invitationRepository.create({
                organizationId,
                email,
                role,
                invitedBy,
                token: this.generateInvitationToken(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            });

            await this.invitationRepository.save(invitation);

            // Send invitation email
            await this.sendInvitationEmail(invitation, organization);

            // Emit event
            this.eventEmitter.emit('organization.invitation.created', {
                organizationId,
                email,
                role,
                invitedBy,
            });

            return invitation;
        } catch (error) {
            this.logger.error('Error creating invitation:', error);
            throw error;
        }
    }

    async acceptInvitation(token: string, userId: string): Promise<void> {
        try {
            const invitation = await this.invitationRepository.findOne({
                where: { token, status: 'pending' }
            });

            if (!invitation) {
                throw new Error('Invalid or expired invitation');
            }

            if (new Date() > invitation.expiresAt) {
                throw new Error('Invitation has expired');
            }

            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                throw new Error('User not found');
            }

            if (user.email !== invitation.email) {
                throw new Error('Invitation email does not match user email');
            }

            // Add user to organization
            const organization = await this.organizationRepository.findOne({
                where: { id: invitation.organizationId }
            });

            if (!organization) {
                throw new Error('Organization not found');
            }

            // Update organization members
            organization.members = [
                ...(organization.members || []),
                {
                    userId,
                    role: invitation.role,
                    joinedAt: new Date(),
                }
            ];

            await this.organizationRepository.save(organization);

            // Update invitation status
            invitation.status = 'accepted';
            invitation.acceptedAt = new Date();
            await this.invitationRepository.save(invitation);

            // Emit event
            this.eventEmitter.emit('organization.member.added', {
                organizationId: organization.id,
                userId,
                role: invitation.role,
                invitedBy: invitation.invitedBy,
            });
        } catch (error) {
            this.logger.error('Error accepting invitation:', error);
            throw error;
        }
    }

    async cancelInvitation(invitationId: string, cancelledBy: string): Promise<void> {
        try {
            const invitation = await this.invitationRepository.findOne({
                where: { id: invitationId, status: 'pending' }
            });

            if (!invitation) {
                throw new Error('Invitation not found or already processed');
            }

            // Update invitation status
            invitation.status = 'cancelled';
            invitation.cancelledAt = new Date();
            invitation.cancelledBy = cancelledBy;
            await this.invitationRepository.save(invitation);

            // Emit event
            this.eventEmitter.emit('organization.invitation.cancelled', {
                organizationId: invitation.organizationId,
                email: invitation.email,
                cancelledBy,
            });
        } catch (error) {
            this.logger.error('Error cancelling invitation:', error);
            throw error;
        }
    }

    async resendInvitation(invitationId: string): Promise<void> {
        try {
            const invitation = await this.invitationRepository.findOne({
                where: { id: invitationId }
            });

            if (!invitation) {
                throw new Error('Invitation not found');
            }

            if (invitation.status !== 'pending') {
                throw new Error('Can only resend pending invitations');
            }

            const organization = await this.organizationRepository.findOne({
                where: { id: invitation.organizationId }
            });

            if (!organization) {
                throw new Error('Organization not found');
            }

            // Update expiration and token
            invitation.token = this.generateInvitationToken();
            invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            invitation.resendCount = (invitation.resendCount || 0) + 1;
            await this.invitationRepository.save(invitation);

            // Resend email
            await this.sendInvitationEmail(invitation, organization);

            // Emit event
            this.eventEmitter.emit('organization.invitation.resent', {
                organizationId: organization.id,
                email: invitation.email,
                resendCount: invitation.resendCount,
            });
        } catch (error) {
            this.logger.error('Error resending invitation:', error);
            throw error;
        }
    }

    async listPendingInvitations(organizationId: string): Promise<OrganizationInvitation[]> {
        try {
            return await this.invitationRepository.find({
                where: {
                    organizationId,
                    status: 'pending'
                },
                order: {
                    createdAt: 'DESC'
                }
            });
        } catch (error) {
            this.logger.error('Error listing pending invitations:', error);
            throw error;
        }
    }

    private generateInvitationToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private async sendInvitationEmail(
        invitation: OrganizationInvitation,
        organization: Organization
    ): Promise<void> {
        try {
            await this.emailService.send({
                recipient: { email: invitation.email },
                subject: `Invitation to join ${organization.name}`,
                template: 'organization-invitation',
                metadata: {
                    organizationName: organization.name,
                    inviterName: invitation.invitedBy,
                    role: invitation.role,
                    acceptUrl: `${process.env.APP_URL}/invitations/accept?token=${invitation.token}`,
                    expiresAt: invitation.expiresAt,
                }
            });
        } catch (error) {
            this.logger.error('Error sending invitation email:', error);
            throw error;
        }
    }

    async cleanupExpiredInvitations(): Promise<void> {
        try {
            const expiredInvitations = await this.invitationRepository.find({
                where: {
                    status: 'pending',
                    expiresAt: {
                        lte: new Date()
                    }
                }
            });

            for (const invitation of expiredInvitations) {
                invitation.status = 'expired';
                await this.invitationRepository.save(invitation);

                this.eventEmitter.emit('organization.invitation.expired', {
                    organizationId: invitation.organizationId,
                    email: invitation.email,
                });
            }
        } catch (error) {
            this.logger.error('Error cleaning up expired invitations:', error);
            throw error;
        }
    }
}