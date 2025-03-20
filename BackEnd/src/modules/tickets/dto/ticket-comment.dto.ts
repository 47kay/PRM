import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, ValidateNested, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CommentVisibility {
    PUBLIC = 'public',
    INTERNAL = 'internal',
    PRIVATE = 'private'
}

export class CommentAttachment {
    @ApiProperty({ description: 'The original name of the uploaded file' })
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @ApiProperty({ description: 'The file size in bytes' })
    @IsNotEmpty()
    fileSize: number;

    @ApiProperty({ description: 'The MIME type of the file' })
    @IsString()
    @IsNotEmpty()
    mimeType: string;

    @ApiProperty({ description: 'The URL or path to the stored file' })
    @IsString()
    @IsNotEmpty()
    fileUrl: string;
}

export class CreateTicketCommentDto {
    @ApiProperty({
        description: 'The main content of the comment',
        example: 'This is a comment on the ticket'
    })
    @IsString()
    @IsNotEmpty()
    content: string;
    isInternal: boolean;

    @ApiPropertyOptional({
        enum: CommentVisibility,
        description: 'Visibility level of the comment',
        default: CommentVisibility.PUBLIC
    })
    @IsEnum(CommentVisibility)
    @IsOptional()
    visibility?: CommentVisibility;

    @ApiPropertyOptional({
        description: 'ID of the parent comment if this is a reply',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsOptional()
    parentId?: string;

    @ApiPropertyOptional({
        type: [CommentAttachment],
        description: 'Array of attachments for the comment'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CommentAttachment)
    @IsOptional()
    attachments?: CommentAttachment[];

    @ApiPropertyOptional({
        description: 'Mentioned user IDs in the comment',
        type: [String]
    })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    mentionedUserIds?: string[];

    @ApiPropertyOptional({
        description: 'Whether the comment should trigger notifications',
        default: true
    })
    @IsBoolean()
    @IsOptional()
    sendNotifications?: boolean;
}

export class UpdateTicketCommentDto {
    @ApiPropertyOptional({
        description: 'Updated content of the comment',
        example: 'This is the updated comment'
    })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiPropertyOptional({
        enum: CommentVisibility,
        description: 'Updated visibility level of the comment'
    })
    @IsEnum(CommentVisibility)
    @IsOptional()
    visibility?: CommentVisibility;

    @ApiPropertyOptional({
        type: [CommentAttachment],
        description: 'Updated array of attachments'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CommentAttachment)
    @IsOptional()
    attachments?: CommentAttachment[];
}

export class TicketCommentResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the comment',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'The ticket ID this comment belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    ticketId: string;

    @ApiProperty({
        description: 'User ID of the comment author',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    authorId: string;

    @ApiProperty({
        description: 'The main content of the comment',
        example: 'This is a comment on the ticket'
    })
    content: string;

    @ApiProperty({
        enum: CommentVisibility,
        description: 'Visibility level of the comment'
    })
    visibility: CommentVisibility;

    @ApiPropertyOptional({
        description: 'ID of the parent comment if this is a reply',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    parentId?: string;

    @ApiProperty({
        type: [CommentAttachment],
        description: 'Array of attachments for the comment'
    })
    attachments: CommentAttachment[];

    @ApiProperty({
        description: 'Array of mentioned user IDs',
        type: [String]
    })
    mentionedUserIds: string[];

    @ApiProperty({
        description: 'Timestamp when the comment was created',
        example: '2024-02-10T12:00:00Z'
    })
    createdAt: Date;

    @ApiPropertyOptional({
        description: 'Timestamp when the comment was last updated',
        example: '2024-02-10T13:00:00Z'
    })
    updatedAt?: Date;

    @ApiPropertyOptional({
        description: 'Timestamp when the comment was deleted',
        example: '2024-02-10T14:00:00Z'
    })
    deletedAt?: Date;

    @ApiProperty({
        description: 'Whether the comment has been edited',
        example: false
    })
    isEdited: boolean;

    @ApiProperty({
        description: 'Number of replies to this comment',
        example: 0
    })
    replyCount: number;
}