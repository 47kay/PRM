import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Notification } from '../../modules/notifications/entities/notification.entity';
export declare class PushNotificationService {
    private readonly configService;
    private readonly logger;
    private readonly firebaseApp;
    constructor(configService: ConfigService);
    send(notification: Notification): Promise<void>;
    private formatContent;
    private prepareData;
    private getAndroidConfig;
    private getApnsConfig;
    private getWebPushConfig;
    sendBatch(notifications: Notification[]): Promise<admin.messaging.BatchResponse>;
    subscribeTopic(tokens: string[], topic: string): Promise<void>;
    unsubscribeTopic(tokens: string[], topic: string): Promise<void>;
}
