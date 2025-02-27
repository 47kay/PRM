import { NotificationChannel, NotificationCategory, NotificationFrequency } from '../entities/notification-preference.entity';
import { ChannelSettingsDto } from './channel-settings.dto';
export declare class NotificationPreferencesDto {
    category: NotificationCategory;
    channels: NotificationChannel[];
    frequency: NotificationFrequency;
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
    workDays?: string[];
    customSchedule?: {
        days: string[];
        times: string[];
        timezone: string;
    };
    channelSpecificSettings?: ChannelSettingsDto;
    filters?: {
        priority?: string[];
        status?: string[];
        types?: string[];
        senders?: string[];
        keywords?: string[];
        excludeKeywords?: string[];
    };
    importanceThreshold?: number;
    muteAll?: boolean;
    muteUntil?: Date;
    digestSettings?: {
        groupBy?: string[];
        sortBy?: string;
        maxItems?: number;
        format?: string;
    };
    allowReminders?: boolean;
    reminderInterval?: number;
    maxReminders?: number;
    enabledChannels: NotificationChannel[];
}
export declare class CreateNotificationPreferenceDto {
    category: NotificationCategory;
    channels: NotificationChannel[];
    frequency: NotificationFrequency;
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
    workDays?: string[];
    customSchedule?: {
        days: string[];
        times: string[];
        timezone: string;
    };
    channelSpecificSettings?: ChannelSettingsDto;
    filters?: {
        priority?: string[];
        status?: string[];
        types?: string[];
        senders?: string[];
        keywords?: string[];
        excludeKeywords?: string[];
    };
    importanceThreshold?: number;
    muteAll?: boolean;
    muteUntil?: Date;
    digestSettings?: {
        groupBy?: string[];
        sortBy?: string;
        maxItems?: number;
        format?: string;
    };
    allowReminders?: boolean;
    reminderInterval?: number;
    maxReminders?: number;
    metadata?: Record<string, any>;
}
export declare class UpdateNotificationPreferenceDto {
    category?: NotificationCategory;
    channels?: NotificationChannel[];
    frequency?: NotificationFrequency;
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
    workDays?: string[];
    customSchedule?: {
        days: string[];
        times: string[];
        timezone: string;
    };
    channelSpecificSettings?: ChannelSettingsDto;
    filters?: {
        priority?: string[];
        status?: string[];
        types?: string[];
        senders?: string[];
        keywords?: string[];
        excludeKeywords?: string[];
    };
    importanceThreshold?: number;
    muteAll?: boolean;
    muteUntil?: Date;
    digestSettings?: {
        groupBy?: string[];
        sortBy?: string;
        maxItems?: number;
        format?: string;
    };
    allowReminders?: boolean;
    reminderInterval?: number;
    maxReminders?: number;
    metadata?: Record<string, any>;
}
