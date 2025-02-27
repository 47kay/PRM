import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { EmailService } from '../../email/email.service';
import { SmsService } from '../../sms/sms.service';
import { WhatsappService } from '../../whatsapp/services/whatsapp.services';
export declare class NotificationsService {
    private notificationRepository;
    private templateRepository;
    private preferenceRepository;
    private emailService;
    private smsService;
    private whatsappService;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, templateRepository: Repository<NotificationTemplate>, preferenceRepository: Repository<NotificationPreference>, emailService: EmailService, smsService: SmsService, whatsappService: WhatsappService);
    notifyError(source: string, error: Error): Promise<void>;
    sendNotification(userId: string, type: string, data: Record<string, any>): Promise<void>;
    private compileTemplate;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    getUserNotifications(userId: string, options?: {
        skip?: number;
        take?: number;
        includeRead?: boolean;
    }): Promise<{
        notifications: Notification[];
        total: number;
    }>;
}
