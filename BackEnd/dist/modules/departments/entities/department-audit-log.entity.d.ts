import { Department } from './department.entity';
import { User } from '../../users/entities/user.entity';
export declare enum DepartmentAuditAction {
    CREATED = "CREATED",
    UPDATED = "UPDATED",
    DELETED = "DELETED",
    MEMBER_ADDED = "MEMBER_ADDED",
    MEMBER_REMOVED = "MEMBER_REMOVED",
    MEMBER_TRANSFERRED = "MEMBER_TRANSFERRED",
    MANAGER_CHANGED = "MANAGER_CHANGED",
    MOVED = "MOVED",
    REORDERED = "REORDERED"
}
export declare class DepartmentAuditLog {
    id: string;
    departmentId: string;
    department: Department;
    organizationId: string;
    action: DepartmentAuditAction;
    changes: Record<string, any>;
    metadata: Record<string, any>;
    performedById: string;
    performedBy: User;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    affectedUserId: string;
    affectedUser: User;
}
