import { Organization } from './organization.entity';
export declare class OrganizationAuditLog {
    id: string;
    organizationId: string;
    organization: Organization;
    eventType: string;
    data: Record<string, any>;
    performedBy: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    resourceType?: string;
    resourceId?: string;
    actionType?: string;
    status?: 'success' | 'failure' | 'pending';
    errorMessage?: string;
    changes?: {
        before: Record<string, any>;
        after: Record<string, any>;
    };
    tags?: string[];
    isSensitive: boolean;
    duration?: number;
    sessionId?: string;
    requestId?: string;
    environment?: string;
    version?: string;
    performedByEmail?: string;
    performedByRole?: string;
    resourceName?: string;
    retainOnDelete?: boolean;
    complianceMetadata?: {
        dataRetentionPeriod?: number;
        dataClassification?: string;
        regulatoryRequirements?: string[];
        piiInvolved?: boolean;
    };
}
