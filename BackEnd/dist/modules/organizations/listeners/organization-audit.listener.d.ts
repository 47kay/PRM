import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { OrganizationAuditService } from '../services/organization-audit.service';
export declare class OrganizationAuditListener {
    private readonly organizationRepository;
    private readonly auditService;
    private readonly logger;
    constructor(organizationRepository: Repository<Organization>, auditService: OrganizationAuditService);
    handleMemberAdded(payload: {
        organizationId: string;
        userId: string;
        role: string;
        addedBy: string;
    }): Promise<void>;
    handleMemberRemoved(payload: {
        organizationId: string;
        userId: string;
        removedBy: string;
        reason?: string;
    }): Promise<void>;
    handleRoleChanged(payload: {
        organizationId: string;
        userId: string;
        oldRole: string;
        newRole: string;
        changedBy: string;
    }): Promise<void>;
    handleSettingsUpdated(payload: {
        organizationId: string;
        changes: Record<string, any>;
        updatedBy: string;
    }): Promise<void>;
    handleSubscriptionChanged(payload: {
        organizationId: string;
        oldPlan: string;
        newPlan: string;
        changedBy: string;
    }): Promise<void>;
}
