import { NotificationType, NotificationPriority, NotificationChannel } from '../dto/create-notification.dto';
import { NotificationStatus } from '../dto/update-notification.dto';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
export declare class Notification {
    [x: string]: any;
    id: string;
    organizationId: string;
    userId: string;
    senderId: string;
    type: NotificationType;
    title: string;
    content: string;
    priority: NotificationPriority;
    status: NotificationStatus;
    actions?: {
        label: string;
        url: string;
        method?: string;
        data?: Record<string, any>;
    }[];
    scheduledFor?: Date;
    expiresAt?: Date;
    requireConfirmation: boolean;
    data?: Record<string, any>;
    channels: NotificationChannel[];
    category?: string;
    groupId?: string;
    referenceId?: string;
    referenceType?: string;
    silent: boolean;
    read: boolean;
    readAt?: Date;
    deliveredAt?: Date;
    deliveryDetails?: {
        attempts: number;
        lastAttempt: Date;
        channels: {
            channel: NotificationChannel;
            status: 'SUCCESS' | 'FAILED';
            sentAt: Date;
            error?: string;
        }[];
        error?: string;
        timeoutAt?: Date;
    };
    recipientDetails?: {
        slackUserId: any;
        email?: string;
        phone?: string;
        deviceTokens?: string[];
        webhookUrl?: string;
    };
    updatedById?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    organization: Organization;
    user: User;
    sender: User;
    updatedBy?: User;
    get isRead(): boolean;
    get isExpired(): boolean;
    get isScheduled(): boolean;
    get isDelivered(): boolean;
    get requiresAction(): boolean;
    get failedChannels(): NotificationChannel[];
}
export { NotificationChannel };
