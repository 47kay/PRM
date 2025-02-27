import { UserActivityService } from '../services/user-activity.service';
import { Request } from 'express';
interface BaseActivityEvent {
    userId: string;
    organizationId?: string;
    request?: Request;
}
interface AuthActivityEvent extends BaseActivityEvent {
    status: 'SUCCESS' | 'FAILURE';
    failureReason?: string;
}
export declare class UserActivityListener {
    private readonly activityService;
    private readonly logger;
    constructor(activityService: UserActivityService);
    handleUserLogin(event: AuthActivityEvent): Promise<void>;
    handleUserLogout(event: BaseActivityEvent): Promise<void>;
    handlePasswordChange(event: AuthActivityEvent): Promise<void>;
    handleProfileUpdate(event: BaseActivityEvent & {
        changes: Record<string, any>;
    }): Promise<void>;
    handleMfaEnabled(event: BaseActivityEvent): Promise<void>;
    handleMfaDisabled(event: BaseActivityEvent): Promise<void>;
    handleRoleChange(event: BaseActivityEvent & {
        oldRole: string;
        newRole: string;
        changedBy: string;
    }): Promise<void>;
    handleDepartmentAssignment(event: BaseActivityEvent & {
        departmentId: string;
        action: 'ASSIGNED' | 'REMOVED';
        performedBy: string;
    }): Promise<void>;
    handlePermissionChange(event: BaseActivityEvent & {
        changes: {
            added?: string[];
            removed?: string[];
        };
        performedBy: string;
    }): Promise<void>;
    handleDataExport(event: BaseActivityEvent & {
        exportType: string;
        dataTypes: string[];
    }): Promise<void>;
    handleBulkAction(event: BaseActivityEvent & {
        action: string;
        targetIds: string[];
        metadata?: Record<string, any>;
    }): Promise<void>;
}
export {};
