import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { OrganizationSubscriptionService } from '../services/organization-subscription.service';
export declare class OrganizationBillingListener {
    private readonly organizationRepository;
    private readonly subscriptionService;
    private readonly logger;
    constructor(organizationRepository: Repository<Organization>, subscriptionService: OrganizationSubscriptionService);
    handleSubscriptionCreated(payload: {
        organizationId: string;
        planId: string;
    }): Promise<void>;
    handleSubscriptionUpdated(payload: {
        organizationId: string;
        planId: string;
        changes: Record<string, any>;
    }): Promise<void>;
    handleSubscriptionCancelled(payload: {
        organizationId: string;
    }): Promise<void>;
    handlePaymentFailed(payload: {
        organizationId: string;
        failureReason: string;
        attemptCount: number;
    }): Promise<void>;
    handleInvoicePaid(payload: {
        organizationId: string;
        invoiceId: string;
        amount: number;
    }): Promise<void>;
}
