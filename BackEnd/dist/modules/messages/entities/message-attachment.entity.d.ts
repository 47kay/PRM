import type { Message } from './message.entity';
export declare enum AttachmentType {
    IMAGE = "image",
    DOCUMENT = "document",
    AUDIO = "audio",
    VIDEO = "video",
    OTHER = "other"
}
export declare class MessageAttachment {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    type: AttachmentType;
    filePath: string;
    publicUrl: string;
    isUploaded: boolean;
    message: Message;
    messageId: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
