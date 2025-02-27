import { User } from '../../users/entities/user.entity';
export declare enum AuditLogType {
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    DATA_ACCESS = "data_access",
    DATA_MODIFICATION = "data_modification",
    SYSTEM = "system",
    SECURITY = "security",
    COMPLIANCE = "compliance",
    BUSINESS = "business"
}
export declare enum AuditLogSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export declare enum AuditLogStatus {
    SUCCESS = "success",
    FAILURE = "failure",
    PENDING = "pending",
    CANCELLED = "cancelled"
}
export declare class AuditLog {
    id: string;
    type: AuditLogType;
    severity: AuditLogSeverity;
    organizationId: string;
    status: AuditLogStatus;
    action: string;
    description: string;
    metadata: Record<string, any>;
    actorId: string;
    actorType: string;
    actor: User;
    entityId: string;
    entityType: string;
    changes: {
        before: Record<string, any>;
        after: Record<string, any>;
    };
    ipAddress: string;
    userAgent: string;
    requestId: string;
    sessionId: string;
    origin: string;
    timestamp: Date;
    duration: number;
    location: {
        country?: string;
        region?: string;
        city?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    securityContext: {
        permissions?: string[];
        roles?: string[];
        authenticationType?: string;
        authenticationMethod?: string;
        mfaUsed?: boolean;
    };
    complianceMetadata: {
        regulations?: string[];
        dataClassification?: string;
        retentionPeriod?: number;
        piiInvolved?: boolean;
        dlpPolicies?: string[];
    };
    error: {
        code?: string;
        message?: string;
        stack?: string;
        details?: Record<string, any>;
    };
    tags: string[];
    riskAssessment: {
        level?: 'low' | 'medium' | 'high' | 'critical';
        factors?: string[];
        score?: number;
        mitigations?: string[];
    };
    businessContext: {
        process?: string;
        department?: string;
        costCenter?: string;
        projectId?: string;
    };
    systemContext: {
        environment?: string;
        version?: string;
        component?: string;
        hostname?: string;
    };
    lastModified: Date;
    expiresAt: Date;
    archived: boolean;
    archivedAt: Date;
    redacted: boolean;
    redactedAt: Date;
    customMetadata: Record<string, any>;
}
