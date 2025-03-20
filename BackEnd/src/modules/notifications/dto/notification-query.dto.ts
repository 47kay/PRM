import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsEnum,
    IsString,
    IsArray,
    IsBoolean,
    IsDateString,
    IsUUID,
    IsInt,
    Min,
    Max,
    ValidateNested,
    ArrayMinSize,
    ArrayMaxSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationChannel, NotificationCategory } from '../entities/notification-preference.entity';

export class DateRangeDto {
    @ApiPropertyOptional({ description: 'Start date for the range' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date for the range' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class NotificationQueryDto {
    @ApiPropertyOptional({ description: 'Search term for notification content' })
    @IsOptional()
    @IsUUID()
    skip?: number;
    take?: number;
    includeRead?: boolean;

    @ApiPropertyOptional({ enum: NotificationCategory, isArray: true })
    @IsOptional()
    @IsArray()
    @IsEnum(NotificationCategory, { each: true })
    categories?: NotificationCategory[];
    userId?: string;
    organizationId?: string;

    @ApiPropertyOptional({ enum: NotificationChannel, isArray: true })
    @IsOptional()
    @IsArray()
    @IsEnum(NotificationChannel, { each: true })
    channels?: NotificationChannel[];

    @ApiPropertyOptional({ description: 'Filter by read status' })
    @IsOptional()
    @IsBoolean()
    isRead?: boolean;

    @ApiPropertyOptional({ description: 'Filter by archived status' })
    @IsOptional()
    @IsBoolean()
    isArchived?: boolean;

    @ApiPropertyOptional({ description: 'Filter by specific user IDs' })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMaxSize(50)
    userIds?: string[];

    @ApiPropertyOptional({ description: 'Filter by specific recipient IDs' })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMaxSize(50)
    status?: string; // Add this line
    recipientIds?: string[];
    type?: string;
    read?: boolean;
    priority?: string;
    startDate?: Date;
    endDate?: Date;


    

    @ApiPropertyOptional({ description: 'Filter by specific sender IDs' })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMaxSize(50)
    senderIds?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeDto)
    dateRange?: DateRangeDto;

    @ApiPropertyOptional({ description: 'Filter by priority levels' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    priorities?: string[];

    @ApiPropertyOptional({ description: 'Filter by status types' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    statuses?: string[];

    @ApiPropertyOptional({ description: 'Filter by specific tags' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(20)
    tags?: string[];

    @ApiPropertyOptional({ description: 'Filter by actionable status' })
    @IsOptional()
    @IsBoolean()
    isActionable?: boolean;

    @ApiPropertyOptional({ description: 'Filter by action taken status' })
    @IsOptional()
    @IsBoolean()
    isActionTaken?: boolean;

    @ApiPropertyOptional({ description: 'Include deleted notifications' })
    @IsOptional()
    @IsBoolean()
    includeDeleted?: boolean;

    @ApiPropertyOptional({ description: 'Group results by field' })
    @IsOptional()
    @IsString()
    groupBy?: string;

    // Pagination parameters
    @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    // Sorting parameters
    @ApiPropertyOptional({ description: 'Sort field' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';

    // Additional filters
    @ApiPropertyOptional({ description: 'Filter by specific template IDs' })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    templateIds?: string[];

    @ApiPropertyOptional({ description: 'Filter by delivery status' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    deliveryStatuses?: string[];

    @ApiPropertyOptional({ description: 'Include only notifications with attachments' })
    @IsOptional()
    @IsBoolean()
    hasAttachments?: boolean;

    @ApiPropertyOptional({ description: 'Filter by specific source systems' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sources?: string[];

    @ApiPropertyOptional({ description: 'Include metadata in response' })
    @IsOptional()
    @IsBoolean()
    includeMetadata?: boolean;

    @ApiPropertyOptional({ description: 'Include read receipts in response' })
    @IsOptional()
    @IsBoolean()
    includeReadReceipts?: boolean;

    @ApiPropertyOptional({ description: 'Filter by importance level', minimum: 1, maximum: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    importanceLevel?: number;
}