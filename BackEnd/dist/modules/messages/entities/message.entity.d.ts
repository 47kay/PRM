import { MessageType, MessagePriority, MessageStatus } from '../dto/create-message.dto';
import { Organization } from '../../organizations/entities/organization.entity';
import type { User } from '../../users/entities/user.entity';
import type { Contact } from '../../contacts/entities/contact.entity';
import { MessageTemplate } from './message-template.entity';
import { MessageAttachment } from './message-attachment.entity';
export declare class Message {
    id: string;
    organizationId: string;
    type: MessageType;
    contactId: string;
    senderId: string;
    content: string;
    priority: MessagePriority;
    status: MessageStatus;
    emailOptions?: {
        subject: string;
        cc?: string;
        bcc?: string;
        trackOpens?: boolean;
        trackClicks?: boolean;
    };
    templateId?: string;
    scheduledFor?: Date;
    requireConfirmation: boolean;
    confirmedAt?: Date;
    confirmedById?: string;
    deliveredAt?: Date;
    readAt?: Date;
    notes?: string;
    externalId?: string;
    deliveryDetails?: {
        provider: string;
        providerMessageId?: string;
        attempts?: number;
        lastAttempt?: Date;
        errorCode?: string;
        errorMessage?: string;
    };
    metadata?: Record<string, any>;
    parentMessageId?: string;
    updatedById?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    organization: Promise<Organization>;
    sender: Promise<User>;
    updatedBy?: Promise<User>;
    confirmedBy?: Promise<User>;
    contact: Promise<Contact>;
    template?: Promise<MessageTemplate>;
    parentMessage?: Promise<Message>;
    replies?: Promise<Message[]>;
    attachments?: Promise<MessageAttachment[]>;
    get isRead(): boolean;
    get isConfirmed(): boolean;
    get isDelivered(): boolean;
    get isScheduled(): boolean;
    get isFailed(): boolean;
}
