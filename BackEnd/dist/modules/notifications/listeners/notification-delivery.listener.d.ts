import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationChannel } from '../entities/notification.entity';
import { NotificationDeliveryService } from '../services/notification-delivery.service';
export declare class NotificationDeliveryListener {
    private readonly notificationRepository;
    private readonly deliveryService;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, deliveryService: NotificationDeliveryService);
    handleNotificationDelivered(payload: {
        notification: Notification;
        channel: NotificationChannel;
    }): Promise<void>;
    handleNotificationFailed(payload: {
        notification: Notification;
        channel: NotificationChannel;
        error: any;
        retry?: boolean;
    }): Promise<void>;
    handleDeliveryTimeout(notification: Notification): Promise<void>;
}
