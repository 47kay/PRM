// src/modules/notifications/dto/channel-settings.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsArray,
    IsString,
    IsBoolean,
    IsEmail,
    IsPhoneNumber,
    IsEnum,
    ValidateNested,
    IsUrl,
    MaxLength,
    ArrayMaxSize,
    IsNumber,
    Min,
    Max,
    IsObject
} from 'class-validator';
import { Type } from 'class-transformer';

export class WebhookRetryConfigDto {
    @ApiPropertyOptional({ description: 'Maximum number of retry attempts' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    maxAttempts?: number;

    @ApiPropertyOptional({ description: 'Delay between retry attempts in seconds' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(300)
    retryDelay?: number;
}

export class WebhookSettingsDto {
    @ApiPropertyOptional({ description: 'Webhook URL' })
    @IsOptional()
    @IsUrl()
    url?: string;

    @ApiPropertyOptional({ description: 'Secret key for webhook authentication' })
    @IsOptional()
    @IsString()
    secret?: string;

    @ApiPropertyOptional({ description: 'Custom headers for webhook requests' })
    @IsOptional()
    @IsObject()
    headers?: Record<string, string>;

    @ApiPropertyOptional({ description: 'Retry configuration for failed webhooks' })
    @IsOptional()
    @ValidateNested()
    @Type(() => WebhookRetryConfigDto)
    retryConfig?: WebhookRetryConfigDto;
}

export class EmailSettingsDto {
    @ApiPropertyOptional({ type: [String], description: 'List of email addresses' })
    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    @ArrayMaxSize(5)
    addresses?: string[];

    @ApiPropertyOptional({ enum: ['HTML', 'TEXT'], description: 'Email format preference' })
    @IsOptional()
    @IsEnum(['HTML', 'TEXT'])
    format?: 'HTML' | 'TEXT';

    @ApiPropertyOptional({ description: 'Whether to include attachments in email notifications' })
    @IsOptional()
    @IsBoolean()
    includeAttachments?: boolean;

    @ApiPropertyOptional({ description: 'Custom email template ID' })
    @IsOptional()
    @IsString()
    templateId?: string;

    @ApiPropertyOptional({ description: 'Email signature' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    signature?: string;
}

export class SmsSettingsDto {
    @ApiPropertyOptional({ type: [String], description: 'List of phone numbers' })
    @IsOptional()
    @IsArray()
    @IsPhoneNumber(undefined, { each: true })
    @ArrayMaxSize(3)
    phoneNumbers?: string[];

    @ApiPropertyOptional({ description: 'Whether to include media in SMS' })
    @IsOptional()
    @IsBoolean()
    includeMedia?: boolean;

    @ApiPropertyOptional({ description: 'Preferred SMS provider' })
    @IsOptional()
    @IsString()
    provider?: string;

    @ApiPropertyOptional({ description: 'Whether to use URL shortening in SMS' })
    @IsOptional()
    @IsBoolean()
    useUrlShortening?: boolean;
}

export class PushSettingsDto {
    @ApiPropertyOptional({ type: [String], description: 'Device tokens for push notifications' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    deviceTokens?: string[];

    @ApiPropertyOptional({ description: 'Whether to play sound with push notifications' })
    @IsOptional()
    @IsBoolean()
    sound?: boolean;

    @ApiPropertyOptional({ description: 'Whether to show badge count' })
    @IsOptional()
    @IsBoolean()
    badge?: boolean;

    @ApiPropertyOptional({ description: 'Whether to use rich notifications' })
    @IsOptional()
    @IsBoolean()
    useRichNotifications?: boolean;

    @ApiPropertyOptional({ description: 'Custom notification sound name' })
    @IsOptional()
    @IsString()
    soundName?: string;
}

export class InAppSettingsDto {
    @ApiPropertyOptional({ description: 'Whether to show badge count' })
    @IsOptional()
    @IsBoolean()
    showBadge?: boolean;

    @ApiPropertyOptional({ description: 'Whether to play sound' })
    @IsOptional()
    @IsBoolean()
    playSound?: boolean;

    @ApiPropertyOptional({ description: 'Whether to mark as read when opened' })
    @IsOptional()
    @IsBoolean()
    markAsRead?: boolean;

    @ApiPropertyOptional({ description: 'Whether to show desktop notifications' })
    @IsOptional()
    @IsBoolean()
    showDesktopNotifications?: boolean;

    @ApiPropertyOptional({ description: 'Maximum number of unread notifications to show' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    maxUnreadCount?: number;
}

export class WhatsappSettingsDto {
    @ApiPropertyOptional({ type: [String], description: 'WhatsApp numbers' })
    @IsOptional()
    @IsArray()
    @IsPhoneNumber(undefined, { each: true })
    @ArrayMaxSize(2)
    numbers?: string[];

    @ApiPropertyOptional({ description: 'Whether to allow media messages' })
    @IsOptional()
    @IsBoolean()
    allowMedia?: boolean;

    @ApiPropertyOptional({ description: 'Language preference for WhatsApp messages' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Template namespace for business accounts' })
    @IsOptional()
    @IsString()
    templateNamespace?: string;
}

export class SlackSettingsDto {
    @ApiPropertyOptional({ type: [String], description: 'Slack channel names' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(5)
    channels?: string[];

    @ApiPropertyOptional({ description: 'Whether to mention user in messages' })
    @IsOptional()
    @IsBoolean()
    mentionUser?: boolean;

    @ApiPropertyOptional({ description: 'Slack workspace ID' })
    @IsOptional()
    @IsString()
    workspaceId?: string;

    @ApiPropertyOptional({ description: 'Use thread replies for updates' })
    @IsOptional()
    @IsBoolean()
    useThreads?: boolean;
}

export class TeamsSettingsDto {
    @ApiPropertyOptional({ type: [String], description: 'Teams channel IDs' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(5)
    channelIds?: string[];

    @ApiPropertyOptional({ description: 'Whether to use adaptive cards' })
    @IsOptional()
    @IsBoolean()
    useAdaptiveCards?: boolean;

    @ApiPropertyOptional({ description: 'Whether to show user mentions' })
    @IsOptional()
    @IsBoolean()
    showMentions?: boolean;
}

export class ChannelSettingsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => EmailSettingsDto)
    email?: EmailSettingsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => SmsSettingsDto)
    sms?: SmsSettingsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => PushSettingsDto)
    push?: PushSettingsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => InAppSettingsDto)
    inApp?: InAppSettingsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => WhatsappSettingsDto)
    whatsapp?: WhatsappSettingsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => SlackSettingsDto)
    slack?: SlackSettingsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => TeamsSettingsDto)
    teams?: TeamsSettingsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => WebhookSettingsDto)
    webhook?: WebhookSettingsDto;
}