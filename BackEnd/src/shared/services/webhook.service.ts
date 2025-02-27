import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig as OriginalAxiosRequestConfig, AxiosResponse } from 'axios';

interface AxiosRequestConfig extends OriginalAxiosRequestConfig {
    metadata?: { startTime: number };
}
import * as crypto from 'crypto';
import { Notification } from '../../modules/notifications/entities/notification.entity';

interface WebhookConfig {
    url: string;
    method?: 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    secret?: string;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    validateResponse?: boolean;
}

interface WebhookDeliveryResult {
    success: boolean;
    statusCode?: number;
    error?: string;
    retryCount?: number;
    duration?: number;
}

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'key', 'auth', 'credentials'];

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);
    private readonly axiosInstance: AxiosInstance;
    private readonly defaultConfig: Partial<WebhookConfig>;

    constructor(private readonly configService: ConfigService) {
        this.axiosInstance = axios.create({
            timeout: this.configService.get<number>('WEBHOOK_TIMEOUT', 5000),
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': `${this.configService.get('APP_NAME', 'NotificationService')}/1.0`,
            },
            validateStatus: (status) => status >= 200 && status < 300,
        });

        this.defaultConfig = {
            method: 'POST',
            timeout: 5000,
            retryAttempts: 3,
            retryDelay: 1000,
            validateResponse: true,
        };

        // Add request interceptor for logging
        this.axiosInstance.interceptors.request.use(
            (config) => {
                (config as AxiosRequestConfig).metadata = { startTime: Date.now() };
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor for logging
        this.axiosInstance.interceptors.response.use(
            (response) => {
                const metadata = (response.config as AxiosRequestConfig).metadata;
                const duration = Date.now() - (metadata?.startTime ?? Date.now());
                this.logger.debug(`Webhook request completed in ${duration}ms`);
                return response;
            },
            (error) => {
                const duration = Date.now() - error.config.metadata.startTime;
                this.logger.error(`Webhook request failed after ${duration}ms: ${error.message}`);
                return Promise.reject(error);
            }
        );
    }

    async send(notification: Notification): Promise<WebhookDeliveryResult> {
        const startTime = Date.now();
        const webhookConfig = this.getWebhookConfig(notification);
        let attempt = 0;
        let lastError: Error | null = null;

        while (attempt < (webhookConfig.retryAttempts ?? this.defaultConfig.retryAttempts ?? 3)) {
            try {
                const response = await this.makeRequest(notification, webhookConfig);
                const duration = Date.now() - startTime;

                if (webhookConfig.validateResponse && !this.isValidResponse(response)) {
                    throw new Error('Invalid response received from webhook endpoint');
                }

                return {
                    success: true,
                    statusCode: response.status,
                    retryCount: attempt,
                    duration,
                };
            } catch (error) {
                attempt++;
                lastError = error;
                this.logger.warn(
                    `Webhook delivery attempt ${attempt} failed for notification ${notification.id}:`,
                    error.message
                );

                if (attempt < ((webhookConfig.retryAttempts ?? this.defaultConfig.retryAttempts) ?? 3)) {
                    await this.delay(((webhookConfig.retryDelay ?? this.defaultConfig.retryDelay) ?? 1000) * Math.pow(2, attempt - 1)); // Exponential backoff
                }
            }
        }

        return {
            success: false,
            error: lastError?.message || 'Unknown error',
            retryCount: attempt,
            duration: Date.now() - startTime,
        };
    }

    private async makeRequest(
        notification: Notification, 
        config: WebhookConfig
    ): Promise<AxiosResponse> {
        const payload = this.preparePayload(notification);
        const signature = this.generateSignature(payload, config.secret);
        const requestId = crypto.randomUUID();

        const requestConfig: AxiosRequestConfig = {
            method: config.method,
            url: config.url,
            data: payload,
            timeout: config.timeout,
            headers: {
                ...config.headers,
                'X-Webhook-Signature': signature,
                'X-Notification-ID': notification.id,
                'X-Request-ID': requestId,
                'X-Timestamp': new Date().toISOString(),
            },
        };

        try {
            return await this.axiosInstance.request(requestConfig);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data;
                throw new Error(
                    `Webhook request failed: ${error.message}. Response: ${JSON.stringify(responseData)}`
                );
            }
            throw error;
        }
    }

    private generateSignature(payload: any, secret?: string): string {
        if (!secret) return '';
        
        return crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');
    }

    private preparePayload(notification: Notification): Record<string, any> {
        const basePayload = {
            id: notification.id,
            type: notification.type,
            subject: notification.subject,
            content: notification.content,
            recipient: this.filterSensitiveData(notification.recipient),
            metadata: notification.metadata,
            timestamp: new Date().toISOString(),
            version: '1.0',
            context: notification.context ? this.filterSensitiveData(notification.context) : undefined,
        };

        // Add additional context if available
        if (notification.context) {
            basePayload['context'] = this.filterSensitiveData(notification.context);
        }

        return basePayload;
    }

    private filterSensitiveData(data: Record<string, any>): Record<string, any> {
        const filtered: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
                continue;
            }

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                filtered[key] = this.filterSensitiveData(value);
            } else {
                filtered[key] = value;
            }
        }

        return filtered;
    }

    private getWebhookConfig(notification: Notification): WebhookConfig {
        const webhookUrl = this.getWebhookUrl(notification);
        
        if (!webhookUrl) {
            throw new Error('No webhook URL configured for notification');
        }

        return {
            ...this.defaultConfig,
            url: webhookUrl,
            secret: this.configService.get('WEBHOOK_SECRET'),
            headers: this.getCustomHeaders(notification),
        } as WebhookConfig;
    }

    private getWebhookUrl(notification: Notification): string {
        // First check notification-specific webhook URL
        if (notification.metadata?.webhookUrl) {
            return notification.metadata.webhookUrl;
        }

        // Then check type-specific webhook URL from config
        const typeSpecificUrl = this.configService.get(`WEBHOOK_URL_${notification.type}`);
        if (typeSpecificUrl) {
            return typeSpecificUrl;
        }

        // Finally fall back to default webhook URL
        return this.configService.get<string>('WEBHOOK_URL') || '';
    }

    private getCustomHeaders(notification: Notification): Record<string, string> {
        const customHeaders: Record<string, string> = {};

        // Add type-specific headers
        if (notification.type) {
            customHeaders['X-Notification-Type'] = notification.type;
        }

        // Add organization-specific headers if available
        if (notification.organizationId) {
            customHeaders['X-Organization-ID'] = notification.organizationId;
        }

        return customHeaders;
    }

    private isValidResponse(response: AxiosResponse): boolean {
        return response.status >= 200 && response.status < 300;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}