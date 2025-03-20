// src/modules/notifications/dto/create-notification.dto.ts

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

export enum NotificationType {
    SYSTEM = 'SYSTEM',
    APPOINTMENT = 'APPOINTMENT',
    MESSAGE = 'MESSAGE',
    TASK = 'TASK',
    ALERT = 'ALERT',
    REMINDER = 'REMINDER',
    DOCUMENT = 'DOCUMENT',
    TICKET_ESCALATED = 'TICKET_ESCALATED',
}

export enum NotificationPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export enum NotificationChannel {
    IN_APP = 'IN_APP',
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PUSH = 'PUSH',
    WEBHOOK = 'WEBHOOK',
    SLACK = "SLACK",
    WHATSAPP = "WHATSAPP",
}

export class NotificationAction {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    label: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    url: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    data?: Record<string, any>;
}

export class NotificationRecipient {
    @ApiProperty()
    @IsUUID()
    userId: string;
    role: string;
    organizationId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsEnum(NotificationChannel, { each: true })
    channels?: NotificationChannel[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

export class CreateNotificationDto {
    @ApiProperty({ enum: NotificationType })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content: string;

    @ApiPropertyOptional({ enum: NotificationPriority })
    @IsOptional()
    @IsEnum(NotificationPriority)
    priority?: NotificationPriority = NotificationPriority.NORMAL;

    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NotificationRecipient)
    recipients: NotificationRecipient[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NotificationAction)
    actions?: NotificationAction[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsISO8601()
    scheduledFor?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsISO8601()
    expiresAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    requireConfirmation?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    data?: Record<string, any>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsEnum(NotificationChannel, { each: true })
    channels?: NotificationChannel[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    groupId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    referenceId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    referenceType?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    silent?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    organizationId: string;
    senderId?: string;
    metadata?: Record<string, any>;
}