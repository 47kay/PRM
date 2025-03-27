// src/modules/notifications/dto/webhook-settings.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsUrl,
    IsString,
    IsObject,
    ValidateNested,
    IsNumber,
    Min,
    Max
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