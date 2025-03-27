export declare class WebhookRetryConfigDto {
    maxAttempts?: number;
    retryDelay?: number;
}
export declare class WebhookSettingsDto {
    url?: string;
    secret?: string;
    headers?: Record<string, string>;
    retryConfig?: WebhookRetryConfigDto;
}
export declare class EmailSettingsDto {
    addresses?: string[];
    format?: 'HTML' | 'TEXT';
    includeAttachments?: boolean;
    templateId?: string;
    signature?: string;
}
export declare class SmsSettingsDto {
    phoneNumbers?: string[];
    includeMedia?: boolean;
    provider?: string;
    useUrlShortening?: boolean;
}
export declare class PushSettingsDto {
    deviceTokens?: string[];
    sound?: boolean;
    badge?: boolean;
    useRichNotifications?: boolean;
    soundName?: string;
}
export declare class InAppSettingsDto {
    showBadge?: boolean;
    playSound?: boolean;
    markAsRead?: boolean;
    showDesktopNotifications?: boolean;
    maxUnreadCount?: number;
}
export declare class WhatsappSettingsDto {
    numbers?: string[];
    allowMedia?: boolean;
    language?: string;
    templateNamespace?: string;
}
export declare class SlackSettingsDto {
    channels?: string[];
    mentionUser?: boolean;
    workspaceId?: string;
    useThreads?: boolean;
}
export declare class TeamsSettingsDto {
    channelIds?: string[];
    useAdaptiveCards?: boolean;
    showMentions?: boolean;
}
export declare class ChannelSettingsDto {
    email?: EmailSettingsDto;
    sms?: SmsSettingsDto;
    push?: PushSettingsDto;
    inApp?: InAppSettingsDto;
    whatsapp?: WhatsappSettingsDto;
    slack?: SlackSettingsDto;
    teams?: TeamsSettingsDto;
    webhook?: WebhookSettingsDto;
}
