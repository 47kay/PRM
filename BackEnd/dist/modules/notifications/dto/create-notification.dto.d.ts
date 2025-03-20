export declare enum NotificationType {
    SYSTEM = "SYSTEM",
    APPOINTMENT = "APPOINTMENT",
    MESSAGE = "MESSAGE",
    TASK = "TASK",
    ALERT = "ALERT",
    REMINDER = "REMINDER",
    DOCUMENT = "DOCUMENT",
    TICKET_ESCALATED = "TICKET_ESCALATED"
}
export declare enum NotificationPriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum NotificationChannel {
    IN_APP = "IN_APP",
    EMAIL = "EMAIL",
    SMS = "SMS",
    PUSH = "PUSH",
    WEBHOOK = "WEBHOOK",
    SLACK = "SLACK",
    WHATSAPP = "WHATSAPP"
}
export declare class NotificationAction {
    label: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: Record<string, any>;
}
export declare class NotificationRecipient {
    userId: string;
    role: string;
    organizationId?: string;
    channels?: NotificationChannel[];
    metadata?: Record<string, any>;
}
export declare class CreateNotificationDto {
    type: NotificationType;
    title: string;
    content: string;
    priority?: NotificationPriority;
    recipients: NotificationRecipient[];
    actions?: NotificationAction[];
    scheduledFor?: string;
    expiresAt?: string;
    requireConfirmation?: boolean;
    data?: Record<string, any>;
    channels?: NotificationChannel[];
    category?: string;
    groupId?: string;
    referenceId?: string;
    referenceType?: string;
    silent?: boolean;
    organizationId: string;
    senderId?: string;
    metadata?: Record<string, any>;
}
