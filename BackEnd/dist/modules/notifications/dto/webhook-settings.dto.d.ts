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
