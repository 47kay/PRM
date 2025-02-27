import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Organization } from '../entities/organization.entity';
import { OrganizationInvitation } from '../entities/organization-invitation.entity';
import { User } from '../../users/entities/user.entity';
import { EmailService } from '../../../shared/services/email.service';
import { OrganizationSubscriptionService } from './organization-subscription.service';
export declare class OrganizationInvitationService {
    private readonly organizationRepository;
    private readonly invitationRepository;
    private readonly userRepository;
    private readonly emailService;
    private readonly subscriptionService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(organizationRepository: Repository<Organization>, invitationRepository: Repository<OrganizationInvitation>, userRepository: Repository<User>, emailService: EmailService, subscriptionService: OrganizationSubscriptionService, eventEmitter: EventEmitter2);
    createInvitation(organizationId: string, email: string, role: string, invitedBy: string): Promise<OrganizationInvitation>;
    acceptInvitation(token: string, userId: string): Promise<void>;
    cancelInvitation(invitationId: string, cancelledBy: string): Promise<void>;
    resendInvitation(invitationId: string): Promise<void>;
    listPendingInvitations(organizationId: string): Promise<OrganizationInvitation[]>;
    private generateInvitationToken;
    private sendInvitationEmail;
    cleanupExpiredInvitations(): Promise<void>;
}
