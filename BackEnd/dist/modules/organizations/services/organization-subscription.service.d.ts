import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Organization } from '../entities/organization.entity';
export declare class OrganizationSubscriptionService {
    private readonly organizationRepository;
    private readonly eventEmitter;
    private readonly logger;
    constructor(organizationRepository: Repository<Organization>, eventEmitter: EventEmitter2);
    createSubscription(organizationId: string, planId: string): Promise<void>;
    updateSubscription(organizationId: string, planId: string, changes: Record<string, any>): Promise<void>;
    cancelSubscription(organizationId: string, reason?: string): Promise<void>;
    checkSubscriptionStatus(organizationId: string): Promise<boolean>;
    validateFeatureAccess(organizationId: string, feature: string): Promise<boolean>;
    checkResourceLimit(organizationId: string, resource: string): Promise<{
        allowed: boolean;
        limit: number;
        current: number;
    }>;
    private getPlan;
    private getCurrentResourceUsage;
}
