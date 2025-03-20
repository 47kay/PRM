import { CreateNotificationDto } from './create-notification.dto';
export declare enum NotificationStatus {
    SCHEDULED = "SCHEDULED",
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED",
    PROCESSING = "PROCESSING",
    RETRY_PENDING = "RETRY_PENDING"
}
declare const UpdateNotificationDto_base: import("@nestjs/common").Type<Partial<Omit<CreateNotificationDto, "type" | "recipients">>>;
export declare class UpdateNotificationDto extends UpdateNotificationDto_base {
    status?: NotificationStatus;
    isDeleted?: boolean;
    read?: boolean;
}
export {};
