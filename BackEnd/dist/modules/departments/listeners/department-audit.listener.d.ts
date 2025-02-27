import { DepartmentAuditService } from '../services/department-audit.service';
import { Request } from 'express';
export declare class DepartmentAuditListener {
    private readonly auditService;
    constructor(auditService: DepartmentAuditService);
    handleDepartmentCreated(event: {
        departmentId: string;
        organizationId: string;
        createdById: string;
        request?: Request;
    }): Promise<void>;
    handleDepartmentUpdated(event: {
        departmentId: string;
        organizationId: string;
        updatedById: string;
        changes: Record<string, any>;
        request?: Request;
    }): Promise<void>;
    handleDepartmentDeleted(event: {
        departmentId: string;
        organizationId: string;
        deletedById: string;
        request?: Request;
    }): Promise<void>;
    handleDepartmentMoved(event: {
        departmentId: string;
        organizationId: string;
        performedById: string;
        previousParentId?: string;
        newParentId?: string;
        request?: Request;
    }): Promise<void>;
    handleDepartmentReordered(event: {
        departmentId: string;
        organizationId: string;
        performedById: string;
        newOrder: string[];
        request?: Request;
    }): Promise<void>;
    handleBulkUpdate(event: {
        departmentIds: string[];
        organizationId: string;
        performedById: string;
        changes: Record<string, any>;
        request?: Request;
    }): Promise<void>;
    handleHierarchyChanged(event: {
        departmentId: string;
        organizationId: string;
        performedById: string;
        changes: {
            oldHierarchy: Record<string, any>;
            newHierarchy: Record<string, any>;
        };
        request?: Request;
    }): Promise<void>;
    handleSettingsUpdated(event: {
        departmentId: string;
        organizationId: string;
        performedById: string;
        changes: Record<string, any>;
        request?: Request;
    }): Promise<void>;
    handleAccessModified(event: {
        departmentId: string;
        organizationId: string;
        performedById: string;
        changes: {
            roleId: string;
            permissions: string[];
            action: 'GRANTED' | 'REVOKED';
        };
        request?: Request;
    }): Promise<void>;
}
