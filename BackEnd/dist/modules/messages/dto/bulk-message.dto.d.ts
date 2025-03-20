import { CreateMessageDto } from './create-message.dto';
import { MessageType } from '../enums/message-type.enum';
export declare class AttachmentDto {
    filename: string;
    contentType: string;
    content: string;
}
export declare class BulkMessageDto {
    contactIds: string[];
    messageData: CreateMessageDto;
    subject?: string;
    content: string;
    type: MessageType;
    templateId?: string;
    variables?: Record<string, any>;
    attachments?: AttachmentDto[];
    scheduledFor?: string;
    organizationId?: string;
    senderId?: string;
}
