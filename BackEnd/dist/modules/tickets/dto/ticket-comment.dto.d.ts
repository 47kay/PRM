export declare enum CommentVisibility {
    PUBLIC = "public",
    INTERNAL = "internal",
    PRIVATE = "private"
}
export declare class CommentAttachment {
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileUrl: string;
}
export declare class CreateTicketCommentDto {
    content: string;
    isInternal: boolean;
    visibility?: CommentVisibility;
    parentId?: string;
    attachments?: CommentAttachment[];
    mentionedUserIds?: string[];
    sendNotifications?: boolean;
}
export declare class UpdateTicketCommentDto {
    content?: string;
    visibility?: CommentVisibility;
    attachments?: CommentAttachment[];
}
export declare class TicketCommentResponseDto {
    id: string;
    ticketId: string;
    authorId: string;
    content: string;
    visibility: CommentVisibility;
    parentId?: string;
    attachments: CommentAttachment[];
    mentionedUserIds: string[];
    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    isEdited: boolean;
    replyCount: number;
}
