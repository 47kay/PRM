import { DepartmentAuditService } from '../services/department-audit.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { UsersService } from '../../users/services/users.service';
interface DepartmentAssignmentEvent {
    departmentId: string;
    organizationId: string;
    userId: string;
    performedById: string;
    action: 'ASSIGNED' | 'UNASSIGNED' | 'TRANSFERRED';
    previousDepartmentId?: string;
}
export declare class DepartmentAssignmentListener {
    private readonly auditService;
    private readonly notificationsService;
    private readonly usersService;
    constructor(auditService: DepartmentAuditService, notificationsService: NotificationsService, usersService: UsersService);
    handleMemberAdded(event: DepartmentAssignmentEvent): Promise<void>;
    handleMemberRemoved(event: DepartmentAssignmentEvent): Promise<void>;
    handleMemberTransferred(event: DepartmentAssignmentEvent): Promise<void>;
    handleManagerChanged(event: {
        departmentId: string;
        organizationId: string;
        previousManagerId?: string;
        newManagerId: string;
        performedById: string;
    }): Promise<void>;
}
export {};
