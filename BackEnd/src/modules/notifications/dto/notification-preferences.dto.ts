import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsBoolean,
    IsOptional,
    IsString,
    IsArray,
    IsInt,
    Min,
    Max,
    ValidateNested,
    IsDateString,
    IsObject,
    Matches,
    ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationChannel, NotificationCategory, NotificationFrequency } from '../entities/notification-preference.entity';
import { ChannelSettingsDto } from './channel-settings.dto';

export class NotificationPreferencesDto {
    category: NotificationCategory;
    channels: NotificationChannel[];
    frequency: NotificationFrequency;
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
    workDays?: string[];
    customSchedule?: {
        days: string[];
        times: string[];
        timezone: string;
    };
    channelSpecificSettings?: ChannelSettingsDto;
    filters?: {
        priority?: string[];
        status?: string[];
        types?: string[];
        senders?: string[];
        keywords?: string[];
        excludeKeywords?: string[];
    };
    importanceThreshold?: number;
    muteAll?: boolean;
    muteUntil?: Date;
    digestSettings?: {
        groupBy?: string[];
        sortBy?: string;
        maxItems?: number;
        format?: string;
    };
    allowReminders?: boolean;
    reminderInterval?: number;
    maxReminders?: number;
    
    // Changed from @Column decorator to ApiProperty
    @ApiProperty({ 
        enum: NotificationChannel, 
        isArray: true,
        default: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        description: 'Enabled notification channels'
    })
    enabledChannels: NotificationChannel[];
}

export class CreateNotificationPreferenceDto {
    @ApiProperty({ enum: NotificationCategory })
    @IsEnum(NotificationCategory)
    category: NotificationCategory;

    @ApiProperty({ enum: NotificationChannel, isArray: true })
    @IsArray()
    @IsEnum(NotificationChannel, { each: true })
    @ArrayMinSize(1)
    channels: NotificationChannel[];

    @ApiProperty({ enum: NotificationFrequency })
    @IsEnum(NotificationFrequency)
    frequency: NotificationFrequency;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Start time must be in HH:mm format'
    })
    startTime?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'End time must be in HH:mm format'
    })
    endTime?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    workDays?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => CustomScheduleDto)
    customSchedule?: {
        days: string[];
        times: string[];
        timezone: string;
    };

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => ChannelSettingsDto)
    channelSpecificSettings?: ChannelSettingsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => NotificationFiltersDto)
    filters?: {
        priority?: string[];
        status?: string[];
        types?: string[];
        senders?: string[];
        keywords?: string[];
        excludeKeywords?: string[];
    };

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    importanceThreshold?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    muteAll?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    muteUntil?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DigestSettingsDto)
    digestSettings?: {
        groupBy?: string[];
        sortBy?: string;
        maxItems?: number;
        format?: string;
    };

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    allowReminders?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    reminderInterval?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    maxReminders?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

// Supporting DTOs for nested validation
class CustomScheduleDto {
    @IsArray()
    @IsString({ each: true })
    days: string[];

    @IsArray()
    @IsString({ each: true })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Times must be in HH:mm format',
        each: true
    })
    times: string[];

    @IsString()
    timezone: string;
}

class NotificationFiltersDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    priority?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    status?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    types?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    senders?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    keywords?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    excludeKeywords?: string[];
}

class DigestSettingsDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    groupBy?: string[];

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    maxItems?: number;

    @IsOptional()
    @IsString()
    format?: string;
}

export class UpdateNotificationPreferenceDto {
    @ApiPropertyOptional({ enum: NotificationCategory })
    @IsOptional()
    @IsEnum(NotificationCategory)
    category?: NotificationCategory;

    @ApiPropertyOptional({ enum: NotificationChannel, isArray: true })
    @IsOptional()
    @IsArray()
    @IsEnum(NotificationChannel, { each: true })
    channels?: NotificationChannel[];

    @ApiPropertyOptional({ enum: NotificationFrequency })
    @IsOptional()
    @IsEnum(NotificationFrequency)
    frequency?: NotificationFrequency;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Start time must be in HH:mm format'
    })
    startTime?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'End time must be in HH:mm format'
    })
    endTime?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    workDays?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => CustomScheduleDto)
    customSchedule?: {
        days: string[];
        times: string[];
        timezone: string;
    };

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => ChannelSettingsDto)
    channelSpecificSettings?: ChannelSettingsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => NotificationFiltersDto)
    filters?: {
        priority?: string[];
        status?: string[];
        types?: string[];
        senders?: string[];
        keywords?: string[];
        excludeKeywords?: string[];
    };

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    importanceThreshold?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    muteAll?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    muteUntil?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DigestSettingsDto)
    digestSettings?: {
        groupBy?: string[];
        sortBy?: string;
        maxItems?: number;
        format?: string;
    };

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    allowReminders?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    reminderInterval?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    maxReminders?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}