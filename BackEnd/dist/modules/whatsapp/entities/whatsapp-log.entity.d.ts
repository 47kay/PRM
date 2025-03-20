import { WhatsappTemplate } from './whatsapp-template.entity';
export declare enum WhatsappMessageStatus {
    QUEUED = "queued",
    SENDING = "sending",
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed",
    REJECTED = "rejected",
    CANCELED = "canceled",
    EXPIRED = "expired"
}
export declare enum WhatsappMessageType {
    TEXT = "text",
    TEMPLATE = "template",
    IMAGE = "image",
    DOCUMENT = "document",
    AUDIO = "audio",
    VIDEO = "video",
    STICKER = "sticker",
    LOCATION = "location",
    CONTACT = "contact",
    INTERACTIVE = "interactive",
    REACTION = "reaction",
    BUTTON = "button"
}
export declare enum WhatsappMediaType {
    IMAGE = "image",
    DOCUMENT = "document",
    AUDIO = "audio",
    VIDEO = "video",
    STICKER = "sticker"
}
export declare class WhatsappLog {
    id: string;
    organizationId: string;
    messageType: WhatsappMessageType;
    templateId?: string;
    template?: WhatsappTemplate;
    to: string;
    toName?: string;
    from: string;
    content?: string;
    status: WhatsappMessageStatus;
    messageId?: string;
    conversationId?: string;
    metadata?: Record<string, any>;
    variables?: Record<string, any>;
    components?: {
        type: string;
        parameters: any[];
    }[];
    mediaData?: {
        type: WhatsappMediaType;
        id?: string;
        url?: string;
        caption?: string;
        filename?: string;
        mimeType?: string;
        size?: number;
    };
    deliveryDetails?: {
        provider?: string;
        attemptCount?: number;
        lastAttemptAt?: Date;
        deliveredAt?: Date;
        readAt?: Date;
        error?: string;
        errorCode?: string;
        errorDetails?: any;
        receivedAt?: Date;
        cost?: number;
        currency?: string;
        wamid?: string;
        phoneType?: string;
        phoneModel?: string;
        pricing?: {
            pricing_model: string;
            category: string;
            cost: number;
            currency: string;
        };
    };
    recipientId?: string;
    senderId?: string;
    referenceId?: string;
    referenceType?: string;
    scheduledFor?: Date;
    createdById?: string;
    createdAt: Date;
    updatedAt: Date;
    isAutomated: boolean;
    buttons?: {
        type: string;
        text: string;
        payload?: string;
    }[];
    contextInfo?: {
        messageId?: string;
        forwarded?: boolean;
        frequentlyForwarded?: boolean;
        fromGroup?: boolean;
        groupId?: string;
        groupName?: string;
        quotedMessageId?: string;
        quotedMessageText?: string;
        quotedMessageSender?: string;
        mentionedContacts?: string[];
    };
    externalBusinessId?: string;
    isInFinalStatus(): boolean;
    isSuccessful(): boolean;
    updateStatus(status: WhatsappMessageStatus, details?: Partial<WhatsappLog['deliveryDetails']>): void;
    getFormattedContent(): string;
    getCost(): {
        amount: number;
        currency: string;
    } | null;
}
