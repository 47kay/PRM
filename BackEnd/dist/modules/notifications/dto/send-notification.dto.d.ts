export declare enum NotificationPriority {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare enum NotificationType {
    DEPARTMENT_ASSIGNMENT = "DEPARTMENT_ASSIGNMENT",
    DEPARTMENT_UNASSIGNMENT = "DEPARTMENT_UNASSIGNMENT",
    DEPARTMENT_TRANSFER = "DEPARTMENT_TRANSFER",
    DEPARTMENT_MANAGER_ASSIGNMENT = "DEPARTMENT_MANAGER_ASSIGNMENT",
    DEPARTMENT_MANAGER_UNASSIGNMENT = "DEPARTMENT_MANAGER_UNASSIGNMENT",
    TICKET_ASSIGNED = "TICKET_ASSIGNED",
    TICKET_UNASSIGNED = "TICKET_UNASSIGNED",
    TICKET_UPDATED = "TICKET_UPDATED",
    TICKET_COMMENT = "TICKET_COMMENT",
    TICKET_STATUS_CHANGED = "TICKET_STATUS_CHANGED",
    SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
    TASK_REMINDER = "TASK_REMINDER",
    USER_MENTION = "USER_MENTION",
    USER_INVITATION = "USER_INVITATION",
    CUSTOM = "CUSTOM"
}
export declare class SendNotificationDto {
    userId: string;
    type: string;
    title: string;
    message: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    organizationId?: string;
    data?: Record<string, any>;
    sendImmediately?: boolean;
    persist?: boolean;
    scheduledFor?: Date;
}
export declare class BulkSendNotificationDto {
    userIds: string[];
    type: string;
    title: string;
    message: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    organizationId?: string;
    data?: Record<string, any>;
    sendImmediately?: boolean;
    persist?: boolean;
    scheduledFor?: Date;
}
