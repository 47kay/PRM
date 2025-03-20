import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { NotificationPreferencesDto } from '../dto/notification-preferences.dto';
import { CustomRequest } from '../../../interfaces/request.interface';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto, req: CustomRequest): Promise<void>;
    findAll(query: NotificationQueryDto, req: CustomRequest): Promise<{
        notifications: import("../entities/notification.entity").Notification[];
        total: number;
    }>;
    getUnreadCount(req: CustomRequest): Promise<number>;
    findOne(id: string, req: CustomRequest): Promise<import("../entities/notification.entity").Notification>;
    update(id: string, updateNotificationDto: UpdateNotificationDto, req: CustomRequest): Promise<import("../entities/notification.entity").Notification>;
    remove(id: string, req: CustomRequest): Promise<void>;
    markAsRead(id: string, req: CustomRequest): Promise<void>;
    markAllAsRead(req: CustomRequest): Promise<void>;
    getPreferences(req: CustomRequest): Promise<any>;
    updatePreferences(preferencesDto: NotificationPreferencesDto, req: CustomRequest): Promise<any>;
    sendTestNotification(data: {
        type: string;
    }, req: CustomRequest): Promise<void>;
    getChannels(req: CustomRequest): Promise<any>;
}
