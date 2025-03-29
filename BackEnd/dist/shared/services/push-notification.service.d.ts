import { ConfigService } from '@nestjs/config';
import { Notification } from '../../modules/notifications/entities/notification.entity';
export declare class PushNotificationService {
    private readonly configService;
    private readonly logger;
    private firebaseApp;
    private mockMode;
    constructor(configService: ConfigService);
    private initializeFirebase;
    private initMockFirebase;
    send(notification: Notification): Promise<void>;
    private formatContent;
    private prepareData;
    private getAndroidConfig;
    private getApnsConfig;
    private getWebPushConfig;
    sendBatch(notifications: Notification[]): Promise<any>;
    subscribeTopic(tokens: string[], topic: string): Promise<void>;
    unsubscribeTopic(tokens: string[], topic: string): Promise<void>;
}
