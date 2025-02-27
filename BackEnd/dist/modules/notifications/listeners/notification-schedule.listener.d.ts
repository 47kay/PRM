import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationSchedulerService } from '../services/notification-scheduler.service';
export declare class NotificationScheduleListener {
    private readonly notificationRepository;
    private readonly schedulerService;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, schedulerService: NotificationSchedulerService);
    handleNotificationSchedule(payload: {
        notification: Notification;
        scheduledFor: Date;
    }): Promise<void>;
    handleNotificationReschedule(payload: {
        notificationId: string;
        newScheduledFor: Date;
    }): Promise<void>;
    handleNotificationCancelSchedule(notificationId: string): Promise<void>;
    handleScheduleExpired(notification: Notification): Promise<void>;
}
