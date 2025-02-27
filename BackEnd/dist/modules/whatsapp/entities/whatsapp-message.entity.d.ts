import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    DOCUMENT = "DOCUMENT",
    AUDIO = "AUDIO",
    LOCATION = "LOCATION",
    CONTACT = "CONTACT",
    TEMPLATE = "TEMPLATE",
    INTERACTIVE = "INTERACTIVE"
}
export declare enum MessageStatus {
    QUEUED = "QUEUED",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
    FAILED = "FAILED",
    UNKNOWN = "UNKNOWN"
}
export declare enum MessageDirection {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND"
}
export declare class WhatsAppMessage {
    id: string;
    from: string;
    to: string;
    messageType: string;
    content: string;
    receivedAt?: Date;
    lastError?: string;
    organizationId: string;
    organization: Organization;
    userId: string;
    user: User;
    recipientPhone: string;
    recipientName: string;
    direction: MessageDirection;
    type: MessageType;
    metadata?: Record<string, any>;
    templateName: string;
    templateData: Record<string, any>;
    status: MessageStatus;
    whatsappMessageId: string;
    errorCode: string | null;
    errorMessage: string | null;
    retryCount: number;
    lastRetryAt: Date;
    sentAt?: Date;
    queuedAt: Date;
    deliveredAt: Date | null;
    readAt: Date | null;
    failedAt: Date;
    attachments: {
        type: string;
        url: string;
        mimeType: string;
        filename?: string;
        size?: number;
    }[];
    locationData: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    };
    contactData: {
        name: string;
        phones: string[];
        emails?: string[];
    }[];
    interactiveData: {
        type: string;
        title: string;
        body: string;
        buttons?: any[];
        selectedOption?: string;
    };
    isScheduled: boolean;
    scheduledFor: Date;
    isTemplate: boolean;
    requiresUserReply: boolean;
    replyTimeoutHours: number;
    replyDeadline: Date;
    isAutomatedReply: boolean;
    automationTriggerId: string;
    createdAt: Date;
    updatedAt: Date;
    canRetry(): boolean;
    isExpired(): boolean;
    shouldSendNow(): boolean;
    updateStatus(status: MessageStatus): void;
    retry(): void;
}
