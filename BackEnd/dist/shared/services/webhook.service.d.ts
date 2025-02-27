import { ConfigService } from '@nestjs/config';
import { Notification } from '../../modules/notifications/entities/notification.entity';
interface WebhookDeliveryResult {
    success: boolean;
    statusCode?: number;
    error?: string;
    retryCount?: number;
    duration?: number;
}
export declare class WebhookService {
    private readonly configService;
    private readonly logger;
    private readonly axiosInstance;
    private readonly defaultConfig;
    constructor(configService: ConfigService);
    send(notification: Notification): Promise<WebhookDeliveryResult>;
    private makeRequest;
    private generateSignature;
    private preparePayload;
    private filterSensitiveData;
    private getWebhookConfig;
    private getWebhookUrl;
    private getCustomHeaders;
    private isValidResponse;
    private delay;
}
export {};
