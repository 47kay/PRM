import { Repository } from 'typeorm';
import { Request } from 'express';
import { DepartmentAuditLog, DepartmentAuditAction } from '../entities/department-audit-log.entity';
import { Department } from '../entities/department.entity';
interface AuditLogOptions {
    departmentId: string;
    organizationId: string;
    action: DepartmentAuditAction;
    performedById: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    affectedUserId?: string;
    request?: Request;
}
interface ChangeRecord {
    old: any;
    new: any;
}
export declare class DepartmentAuditService {
    private readonly auditLogRepository;
    private readonly departmentRepository;
    constructor(auditLogRepository: Repository<DepartmentAuditLog>, departmentRepository: Repository<Department>);
    log(options: AuditLogOptions): Promise<DepartmentAuditLog>;
    getDepartmentAuditTrail(departmentId: string, options?: {
        startDate?: Date;
        endDate?: Date;
        actions?: DepartmentAuditAction[];
        limit?: number;
        offset?: number;
    }): Promise<[DepartmentAuditLog[], number]>;
    getUserDepartmentActivity(userId: string, options?: {
        startDate?: Date;
        endDate?: Date;
        departmentIds?: string[];
        limit?: number;
        offset?: number;
    }): Promise<[DepartmentAuditLog[], number]>;
    compareChanges(oldData: Record<string, any>, newData: Record<string, any>): Record<string, ChangeRecord>;
    cleanupOldLogs(retentionDays?: number): Promise<number>;
}
export {};
