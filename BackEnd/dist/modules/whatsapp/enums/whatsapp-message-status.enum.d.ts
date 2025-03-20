export declare enum WhatsAppMessageStatus {
    DRAFT = "DRAFT",
    QUEUED = "QUEUED",
    SCHEDULED = "SCHEDULED",
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
    FAILED = "FAILED",
    CANCELED = "CANCELED",
    BLOCKED = "BLOCKED",
    EXPIRED = "EXPIRED",
    DELETED = "DELETED",
    UNDELIVERABLE = "UNDELIVERABLE",
    UNKNOWN = "UNKNOWN",
    PERMANENTLY_FAILED = "PERMANENTLY_FAILED",
    RECEIVED = "RECEIVED"
}
interface StatusProperties {
    final: boolean;
    retryable: boolean;
    description: string;
}
export declare const MESSAGE_STATUS_PROPERTIES: Record<WhatsAppMessageStatus, StatusProperties>;
export {};
