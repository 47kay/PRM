import { NotificationPriority, NotificationChannel } from '../dto/create-notification.dto';
import { Organization } from '../../organizations/entities/organization.entity';
import type { User } from '../../users/entities/user.entity';
export declare class Notification {
    [x: string]: any;
    id: string;
    userId: string;
    type: string;
    content: string;
    metadata?: Record<string, any>;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    readAt?: Date;
    organizationId: string;
    senderId: string;
    title: string;
    priority: NotificationPriority;
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
    deletedAt?: Date;
    organization: Promise<Organization>;
    user: Promise<User>;
    sender: Promise<User>;
    updatedBy?: Promise<User>;
    get isRead(): boolean;
    get isExpired(): boolean;
    get isScheduled(): boolean;
    get isDelivered(): boolean;
    get requiresAction(): boolean;
    get failedChannels(): NotificationChannel[];
}
export { NotificationChannel };
