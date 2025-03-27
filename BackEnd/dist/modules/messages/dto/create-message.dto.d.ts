export declare enum MessageType {
    SMS = "SMS",
    EMAIL = "EMAIL",
    WHATSAPP = "WHATSAPP",
    INTERNAL_NOTE = "INTERNAL_NOTE"
}
export declare enum MessagePriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum MessageStatus {
    DRAFT = "DRAFT",
    QUEUED = "QUEUED",
    SENDING = "SENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
    SCHEDULED = "SCHEDULED",
    DELIVERING = "DELIVERING",
    PENDING = "PENDING"
}
export declare class Attachment {
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize?: string;
}
export declare class EmailOptions {
    subject: string;
    cc?: string;
    bcc?: string;
    trackOpens?: boolean;
    trackClicks?: boolean;
}
export declare class CreateMessageDto {
    type: MessageType;
    contactId: string;
    content: string;
    priority?: MessagePriority;
    status?: MessageStatus;
    scheduledFor?: string;
    emailOptions?: EmailOptions;
    attachments?: Attachment[];
    templateId?: string;
    requireConfirmation?: boolean;
    notes?: string;
    externalId?: string;
    subject?: string;
    metadata?: Record<string, any>;
}
