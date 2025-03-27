import type { User } from './user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
export declare enum ActivityType {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    PASSWORD_CHANGE = "PASSWORD_CHANGE",
    PROFILE_UPDATE = "PROFILE_UPDATE",
    TICKET_CREATE = "TICKET_CREATE",
    TICKET_UPDATE = "TICKET_UPDATE",
    TICKET_COMMENT = "TICKET_COMMENT",
    TICKET_ASSIGNMENT = "TICKET_ASSIGNMENT",
    TICKET_STATUS_CHANGE = "TICKET_STATUS_CHANGE",
    MESSAGE_SEND = "MESSAGE_SEND",
    APPOINTMENT_CREATE = "APPOINTMENT_CREATE",
    APPOINTMENT_UPDATE = "APPOINTMENT_UPDATE",
    APPOINTMENT_CANCEL = "APPOINTMENT_CANCEL",
    DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD",
    DOCUMENT_DELETE = "DOCUMENT_DELETE",
    SETTINGS_UPDATE = "SETTINGS_UPDATE",
    API_ACCESS = "API_ACCESS",
    FAILED_LOGIN = "FAILED_LOGIN",
    EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
    PHONE_VERIFICATION = "PHONE_VERIFICATION"
}
export declare class UserActivity {
    id: string;
    userId: string;
    organizationId: string;
    action: string;
    performedById: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    description: string;
    metadata: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    referrer: string;
    status: string;
    failureReason: string;
    activityType: ActivityType;
    details: {
        resourceId?: string;
        resourceType?: string;
        oldValue?: any;
        newValue?: any;
        description?: string;
        additionalInfo?: Record<string, any>;
    };
    isSuccess: boolean;
    errorMessage?: string;
    context: {
        module?: string;
        action?: string;
        target?: string;
        result?: string;
        severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    organization: Organization;
    user: User;
}
