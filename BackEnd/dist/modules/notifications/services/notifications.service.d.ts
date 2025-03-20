import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { EmailService } from '../../../shared/services/email.service';
import { SmsService } from '../../../shared/services/sms.service';
import { WhatsappService } from '../../whatsapp/services/whatsapp.services';
import { Message } from '../../messages/entities/message.entity';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
export interface SendNotificationDto {
    type: string;
    title: string;
    message: string;
    organizationId?: string;
    data?: Record<string, any>;
    userId: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}
export declare class NotificationsService {
    private notificationRepository;
    private templateRepository;
    private preferenceRepository;
    private emailService;
    private smsService;
    private whatsappService;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, templateRepository: Repository<NotificationTemplate>, preferenceRepository: Repository<NotificationPreference>, emailService: EmailService, smsService: SmsService, whatsappService: WhatsappService);
    notifyMessageFailure(message: Message): Promise<void>;
    getNotificationChannels(organizationId: string, userId: string): Promise<any>;
    getUserPreferences(organizationId: string, userId: string): Promise<any>;
    getNotificationById(id: string, organizationId: string, userId: string): Promise<Notification | null>;
    updateNotification(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification>;
    notifyMessageDelivery(message: Message): Promise<void>;
    create(notificationData: {
        type: string;
        title: string;
        content: string;
        recipients: {
            userId: string;
        }[];
        organizationId: string;
        senderId: string;
        priority?: string;
    }): Promise<void>;
    send(dto: SendNotificationDto): Promise<void>;
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
    private sendEmailNotification;
    private sendSmsNotification;
    private formatEmailContent;
    private formatSmsContent;
}
