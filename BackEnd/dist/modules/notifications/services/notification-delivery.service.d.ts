import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { EmailService } from '../../../shared/services/email.service';
import { SmsService } from '../../../shared/services/sms.service';
import { PushNotificationService } from '../../../shared/services/push-notification.service';
import { WebhookService } from '../../../shared/services/webhook.service';
export declare class NotificationDeliveryService {
    private readonly notificationRepository;
    private readonly emailService;
    private readonly smsService;
    private readonly pushNotificationService;
    private readonly webhookService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly MAX_RETRY_ATTEMPTS;
    constructor(notificationRepository: Repository<Notification>, emailService: EmailService, smsService: SmsService, pushNotificationService: PushNotificationService, webhookService: WebhookService, eventEmitter: EventEmitter2);
    processNotification(notification: Notification): Promise<void>;
    retryNotification(notification: Notification): Promise<void>;
    private deliverToChannel;
    getDeliveryStatus(notificationId: string): Promise<{
        status: string;
        deliveryDetails: {
            attempts: number;
            lastAttempt: Date;
            channels: {
                channel: import("../dto/create-notification.dto").NotificationChannel;
                status: "SUCCESS" | "FAILED";
                sentAt: Date;
                error?: string;
            }[];
            error?: string;
            timeoutAt?: Date;
        };
        channels: import("../dto/create-notification.dto").NotificationChannel[];
    }>;
}
