import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Equal, LessThanOrEqual, FindOperator } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { Organization } from '../entities/organization.entity';
import { OrganizationInvitation } from '../entities/organization-invitation.entity';
// Import the enum but use string literals in the code
import { InvitationStatus } from '../enums/invitation-status.enum';
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
                where: { 
                    email, 
                    organizationId 
                }
            });

            if (existingMember) {
                throw new Error(`User ${email} is already a member of the organization`);
            }

            // Check for existing pending invitation - avoid using enum directly
            const existingInvitations = await this.invitationRepository.createQueryBuilder("invitation")
                .where("invitation.organizationId = :organizationId", { organizationId })
                .andWhere("invitation.email = :email", { email })
                .andWhere("invitation.status = :status", { status: "PENDING" })
                .getMany();

            if (existingInvitations.length > 0) {
                throw new Error(`Pending invitation already exists for ${email}`);
            }

            // Create new invitation
            const invitation = new OrganizationInvitation();
            invitation.organizationId = organizationId;
            invitation.email = email;
            invitation.roles = [role]; 
            
            const inviter = await this.userRepository.findOne({
                where: { id: invitedBy }
            });

            if (!inviter) {
                throw new Error(`Inviter ${invitedBy} not found`);
            }

            invitation.invitedBy = inviter;
            invitation.token = this.generateInvitationToken();
            invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            
            // Set status as string and cast
            invitation.status = "PENDING" as any;

            const savedInvitation = await this.invitationRepository.save(invitation);

            // Send invitation email
            await this.sendInvitationEmail(savedInvitation, organization);

            // Emit event
            this.eventEmitter.emit('organization.invitation.created', {
                organizationId,
                email,
                role,
                invitedBy,
            });

            return savedInvitation;
        } catch (error) {
            this.logger.error('Error creating invitation:', error);
            throw error;
        }
    }

    async acceptInvitation(token: string, userId: string): Promise<void> {
        try {
            // Use raw SQL query or TypeORM query builder to avoid enum issues
            const invitations = await this.invitationRepository.createQueryBuilder("invitation")
                .where("invitation.token = :token", { token })
                .andWhere("invitation.status = :status", { status: "PENDING" })
                .getMany();
                
            const invitation = invitations.length > 0 ? invitations[0] : null;

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
                    role: invitation.roles,
                    joinedAt: new Date(),
                }
            ];

            await this.organizationRepository.save(organization);

            // Update invitation - fetch, modify, save pattern
            invitation.status = "ACCEPTED" as any;
            invitation.metadata = {
                ...(invitation.metadata || {}),
                acceptedAt: new Date()
            };
            
            await this.invitationRepository.save(invitation);

            // Emit event
            this.eventEmitter.emit('organization.member.added', {
                organizationId: organization.id,
                userId,
                role: invitation.roles,
                invitedBy: invitation.invitedBy,
            });
        } catch (error) {
            this.logger.error('Error accepting invitation:', error);
            throw error;
        }
    }

    async cancelInvitation(invitationId: string, cancelledBy: string): Promise<void> {
        try {
            // Use query builder to avoid enum issues
            const invitations = await this.invitationRepository.createQueryBuilder("invitation")
                .where("invitation.id = :id", { id: invitationId })
                .andWhere("invitation.status = :status", { status: "PENDING" })
                .getMany();
                
            const invitation = invitations.length > 0 ? invitations[0] : null;

            if (!invitation) {
                throw new Error('Invitation not found or already processed');
            }

            // Update invitation - fetch, modify, save pattern
            invitation.status = "CANCELLED" as any;
            invitation.metadata = {
                ...(invitation.metadata || {}),
                cancelledAt: new Date(),
                cancelledBy: cancelledBy
            };
            
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

            // Compare with string directly
            if (String(invitation.status) !== "PENDING") {
                throw new Error('Can only resend pending invitations');
            }

            const organization = await this.organizationRepository.findOne({
                where: { id: invitation.organizationId }
            });

            if (!organization) {
                throw new Error('Organization not found');
            }

            // Update - fetch, modify, save pattern
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
            // Use query builder to avoid enum issues
            return await this.invitationRepository.createQueryBuilder("invitation")
                .where("invitation.organizationId = :organizationId", { organizationId })
                .andWhere("invitation.status = :status", { status: "PENDING" })
                .orderBy("invitation.createdAt", "DESC")
                .getMany();
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
            // Get inviter name from the User object if available
            let inviterName = 'An organization administrator';
            if (invitation.invitedBy) {
                if (typeof invitation.invitedBy === 'object' && invitation.invitedBy.firstName) {
                    inviterName = `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName || ''}`.trim();
                } else if (typeof invitation.invitedBy === 'string') {
                    inviterName = invitation.invitedBy;
                }
            }

            // Get role as a string
            const roleValue = Array.isArray(invitation.roles) 
                ? invitation.roles.join(', ') 
                : String(invitation.roles || '');

            // Create email notification data
            const emailData = {
                to: invitation.email,
                subject: `Invitation to join ${organization.name}`,
                template: 'organization-invitation',
                context: {
                    organizationName: organization.name,
                    inviterName: inviterName,
                    role: roleValue,
                    acceptUrl: `${process.env.APP_URL}/invitations/accept?token=${invitation.token}`,
                    expiresAt: invitation.expiresAt,
                }
            };

            // Send using your email service's method
            if (typeof this.emailService.sendEmail === 'function') {
                await this.emailService.sendEmail(emailData);
            } else {
                this.logger.warn('No suitable email service method found. Please implement a proper email sending method.');
            }
        } catch (error) {
            this.logger.error('Error sending invitation email:', error);
            throw error;
        }
    }

    async cleanupExpiredInvitations(): Promise<void> {
        try {
            // Use query builder to avoid enum issues
            const expiredInvitations = await this.invitationRepository.createQueryBuilder("invitation")
                .where("invitation.status = :status", { status: "PENDING" })
                .andWhere("invitation.expiresAt <= :now", { now: new Date() })
                .getMany();

            for (const invitation of expiredInvitations) {
                // Update using fetch, modify, save pattern
                invitation.status = "EXPIRED" as any;
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