import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationDeliveryService } from '../services/notification-delivery.service';
import { NotificationTemplate } from '../entities/notification-template.entity';
export declare class NotificationListener {
    private readonly templateRepository;
    private readonly deliveryService;
    private readonly logger;
    constructor(templateRepository: Repository<NotificationTemplate>, deliveryService: NotificationDeliveryService);
    handleNotificationCreated(notification: Notification): Promise<void>;
    handleNotificationResend(notification: Notification): Promise<void>;
    private processTemplate;
    private interpolateVariables;
    private processChannelContent;
}
