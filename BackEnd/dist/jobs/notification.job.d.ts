import { Queue, Job } from 'bull';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Server } from 'socket.io';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { User } from '../modules/users/entities/user.entity';
import { PushSubscription } from '../modules/notifications/entities/push-subscription.entity';
import { EmailService } from '../modules/email/services/email.service';
import { SmsService } from '../modules/sms/services/sms.service';
import { NotificationPriority } from '../modules/notifications/enums/notification-priority.enum';
export interface NotificationJob {
    type: 'SYSTEM' | 'USER' | 'ORGANIZATION';
    title: string;
    message: string;
    data?: Record<string, any>;
    priority?: NotificationPriority;
    recipients: {
        userIds?: string[];
        organizationIds?: string[];
        roles?: string[];
    };
    channels?: {
        inApp?: boolean;
        email?: boolean;
        sms?: boolean;
        push?: boolean;
    };
    metadata?: {
        source?: string;
        category?: string;
        tags?: string[];
        expiresAt?: Date;
    };
}
export declare class NotificationJob {
    private readonly notificationQueue;
    private readonly notificationRepository;
    private readonly userRepository;
    private readonly pushSubscriptionRepository;
    private readonly emailService;
    private readonly smsService;
    private readonly configService;
    private readonly logger;
    server: Server;
    constructor(notificationQueue: Queue<NotificationJob>, notificationRepository: Repository<Notification>, userRepository: Repository<User>, pushSubscriptionRepository: Repository<PushSubscription>, emailService: EmailService, smsService: SmsService, configService: ConfigService);
    processNotification(job: Job<NotificationJob>): Promise<{
        success: boolean;
        error: string;
        notificationIds?: undefined;
    } | {
        success: boolean;
        notificationIds: string[];
        error?: undefined;
    }>;
    private getRecipients;
    private createNotifications;
    private sendInAppNotifications;
    private sendEmailNotifications;
    private sendSmsNotifications;
    private sendPushNotifications;
    private sendPushNotification;
    addToQueue(data: NotificationJob): Promise<Job<NotificationJob>>;
    private getPriorityLevel;
    cleanupOldNotifications(): Promise<void>;
}
