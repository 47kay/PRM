import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
export declare enum NotificationChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    PUSH = "PUSH",
    IN_APP = "IN_APP",
    WHATSAPP = "WHATSAPP",
    SLACK = "SLACK",
    WEBHOOK = "WEBHOOK"
}
export declare enum NotificationCategory {
    APPOINTMENT = "APPOINTMENT",
    TICKET = "TICKET",
    SYSTEM = "SYSTEM",
    SECURITY = "SECURITY",
    BILLING = "BILLING",
    MESSAGING = "MESSAGING",
    TASK = "TASK",
    REMINDER = "REMINDER",
    ALERT = "ALERT",
    NEWS = "NEWS"
}
export declare enum NotificationFrequency {
    IMMEDIATELY = "IMMEDIATELY",
    DAILY_DIGEST = "DAILY_DIGEST",
    WEEKLY_DIGEST = "WEEKLY_DIGEST",
    CUSTOM = "CUSTOM",
    NEVER = "NEVER"
}
export declare class NotificationPreference {
    id: string;
    organizationId: string;
    userId: string;
    category: NotificationCategory;
    channels: NotificationChannel[];
    enabledChannels: NotificationChannel[];
    frequency: NotificationFrequency;
    enabled: boolean;
    startTime?: string;
    endTime?: string;
    workDays?: string[];
    customSchedule?: {
        days: string[];
        times: string[];
        timezone: string;
    };
    channelSpecificSettings?: {
        email?: {
            addresses?: string[];
            format?: 'HTML' | 'TEXT';
            includeAttachments?: boolean;
        };
        sms?: {
            phoneNumbers?: string[];
            includeMedia?: boolean;
        };
        push?: {
            deviceTokens?: string[];
            sound?: boolean;
            badge?: boolean;
        };
        inApp?: {
            showBadge?: boolean;
            playSound?: boolean;
            markAsRead?: boolean;
        };
        whatsapp?: {
            numbers?: string[];
            allowMedia?: boolean;
        };
        slack?: {
            channels?: string[];
            mentionUser?: boolean;
        };
    };
    filters?: {
        priority?: string[];
        status?: string[];
        types?: string[];
        senders?: string[];
        keywords?: string[];
        excludeKeywords?: string[];
    };
    importanceThreshold: number;
    muteAll: boolean;
    muteUntil?: Date;
    digestSettings?: {
        groupBy?: string[];
        sortBy?: string;
        maxItems?: number;
        format?: string;
    };
    allowReminders: boolean;
    reminderInterval?: number;
    maxReminders: number;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdById?: string;
    updatedById?: string;
    organization: Organization;
    user: User;
    createdBy?: User;
    updatedBy?: User;
}
