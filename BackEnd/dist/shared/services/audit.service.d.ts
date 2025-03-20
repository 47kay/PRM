import { Repository } from 'typeorm';
import { Request } from 'express';
import { AuditLog } from '../../modules/audit/entities/audit-log.entity';
export interface AuditLogDto {
    action: string;
    entityType: string;
    entityId: string | number;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    actorId?: string | number;
    organizationId?: string | number;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditService {
    private readonly auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(dto: AuditLogDto, request?: Request): Promise<AuditLog>;
    getEntityAuditLogs(entityType: string, entityId: string | number, options?: {
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
        actions?: string[];
    }): Promise<[AuditLog[], number]>;
    getUserAuditLogs(actorId: string | number, options?: {
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
        actions?: string[];
        entityTypes?: string[];
    }): Promise<[AuditLog[], number]>;
    getOrganizationAuditLogs(organizationId: string | number, options?: {
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
        actions?: string[];
        entityTypes?: string[];
        actorIds?: (string | number)[];
    }): Promise<[AuditLog[], number]>;
    cleanupOldLogs(retentionDays?: number): Promise<number>;
}
