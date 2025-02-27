import { Repository } from 'typeorm';
import { OrganizationAuditLog } from '../entities/organization-audit-log.entity';
interface AuditEventData {
    organizationId: string;
    eventType: string;
    data: Record<string, any>;
    performedBy: string;
    timestamp?: Date;
    metadata?: Record<string, any>;
}
interface AuditQueryOptions {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: string[];
    performedBy?: string;
    limit?: number;
    offset?: number;
}
export declare class OrganizationAuditService {
    private readonly auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<OrganizationAuditLog>);
    logEvent(eventData: AuditEventData): Promise<OrganizationAuditLog>;
    getAuditLogs(organizationId: string, options?: AuditQueryOptions): Promise<{
        logs: OrganizationAuditLog[];
        total: number;
    }>;
    getEventDetails(eventId: string): Promise<OrganizationAuditLog>;
    getActivitySummary(organizationId: string, startDate: Date, endDate: Date): Promise<Record<string, number>>;
    getUserActivity(organizationId: string, userId: string, options?: AuditQueryOptions): Promise<OrganizationAuditLog[]>;
    getRecentChanges(organizationId: string, limit?: number): Promise<OrganizationAuditLog[]>;
    private sanitizeData;
    cleanupOldLogs(retentionDays: number): Promise<number>;
    exportAuditLogs(organizationId: string, startDate: Date, endDate: Date): Promise<any>;
}
export {};
