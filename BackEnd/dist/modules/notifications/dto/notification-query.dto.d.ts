import { NotificationChannel, NotificationCategory } from '../entities/notification-preference.entity';
export declare class DateRangeDto {
    startDate?: string;
    endDate?: string;
}
export declare class NotificationQueryDto {
    organizationId?: string;
    categories?: NotificationCategory[];
    userId?: string;
    channels?: NotificationChannel[];
    isRead?: boolean;
    isArchived?: boolean;
    userIds?: string[];
    status?: string;
    recipientIds?: string[];
    type?: string;
    read?: boolean;
    priority?: string;
    startDate?: Date;
    endDate?: Date;
    senderIds?: string[];
    dateRange?: DateRangeDto;
    priorities?: string[];
    statuses?: string[];
    tags?: string[];
    isActionable?: boolean;
    isActionTaken?: boolean;
    includeDeleted?: boolean;
    groupBy?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    templateIds?: string[];
    deliveryStatuses?: string[];
    hasAttachments?: boolean;
    sources?: string[];
    includeMetadata?: boolean;
    includeReadReceipts?: boolean;
    importanceLevel?: number;
}
