export declare enum WhatsAppMessageStatus {
    DRAFT = "DRAFT",
    QUEUED = "QUEUED",
    SCHEDULED = "SCHEDULED",
    PROCESSING = "PROCESSING",
    RATE_LIMITED = "RATE_LIMITED",
    RETRYING = "RETRYING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
    REPLIED = "REPLIED",
    FAILED = "FAILED",
    REJECTED = "REJECTED",
    INVALID = "INVALID",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
    DELETED = "DELETED",
    PENDING = "PENDING",
    RECEIVED = "RECEIVED",
    PERMANENTLY_FAILED = "PERMANENTLY_FAILED",
    UNKNOWN = "UNKNOWN"
}
export declare const MessageStatusMetadata: {
    DRAFT: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    QUEUED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    SCHEDULED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    PROCESSING: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    RATE_LIMITED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    RETRYING: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    SENT: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    DELIVERED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    READ: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    REPLIED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    FAILED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    REJECTED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    INVALID: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    EXPIRED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    CANCELLED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    DELETED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    PENDING: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    RECEIVED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
    PERMANENTLY_FAILED: {
        final: boolean;
        retryable: boolean;
        description: string;
    };
};
export declare function isFinalStatus(status: WhatsAppMessageStatus): boolean;
export declare function isRetryableStatus(status: WhatsAppMessageStatus): boolean;
export declare function getStatusDescription(status: WhatsAppMessageStatus): string;
export declare function canTransitionTo(currentStatus: WhatsAppMessageStatus, newStatus: WhatsAppMessageStatus): boolean;
