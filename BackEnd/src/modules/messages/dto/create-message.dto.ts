// src/modules/messages/dto/create-message.dto.ts

import { 
    IsString, 
    IsEnum, 
    IsUUID, 
    IsOptional, 
    IsArray, 
    ValidateNested,
    IsBoolean,
    IsNotEmpty,
    MaxLength,
    IsISO8601,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
    SMS = 'SMS',
    EMAIL = 'EMAIL',
    WHATSAPP = 'WHATSAPP',
    INTERNAL_NOTE = 'INTERNAL_NOTE',
}

export enum MessagePriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export enum MessageStatus {
    DRAFT = 'DRAFT',
    QUEUED = 'QUEUED',
    SENDING = 'SENDING',
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    FAILED = 'FAILED',
    SCHEDULED = 'SCHEDULED',
    DELIVERING = 'DELIVERING',
    PENDING = 'PENDING',
}

export class Attachment {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    fileType: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    fileUrl: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    fileSize?: string;
}

export class EmailOptions {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    cc?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bcc?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    trackOpens?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    trackClicks?: boolean;
}

export class CreateMessageDto {
    @ApiProperty({ enum: MessageType })
    @IsEnum(MessageType)
    type: MessageType;

    @ApiProperty()
    @IsUUID()
    contactId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    content: string;

    @ApiPropertyOptional({ enum: MessagePriority })
    @IsOptional()
    @IsEnum(MessagePriority)
    priority?: MessagePriority = MessagePriority.NORMAL;

    @ApiPropertyOptional({ enum: MessageStatus })
    @IsOptional()
    @IsEnum(MessageStatus)
    status?: MessageStatus = MessageStatus.QUEUED;

    @ApiPropertyOptional()
    @IsOptional()
    @IsISO8601()
    scheduledFor?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => EmailOptions)
    emailOptions?: EmailOptions;

    @ApiPropertyOptional({ type: [Attachment] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Attachment)
    attachments?: Attachment[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    templateId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    requireConfirmation?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    externalId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    subject?: string;


    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}