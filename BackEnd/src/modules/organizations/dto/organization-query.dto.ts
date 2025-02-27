import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsEnum,
    IsBoolean,
    IsInt,
    IsDate,
    IsUUID,
    IsArray,
    Min,
    Max,
    ValidateNested,
    IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrganizationStatus, SubscriptionTier } from '../entities/organization.entity';

export class DateRangeDto {
    @ApiPropertyOptional({ description: 'Start date for filtering' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date for filtering' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class OrganizationQueryDto {
    @ApiPropertyOptional({ description: 'Search term for name or domain' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: OrganizationStatus })
    @IsOptional()
    @IsEnum(OrganizationStatus)
    status?: OrganizationStatus;

    @ApiPropertyOptional({ enum: SubscriptionTier })
    @IsOptional()
    @IsEnum(SubscriptionTier)
    subscriptionTier?: SubscriptionTier;

    @ApiPropertyOptional({ description: 'Filter by domain verification status' })
    @IsOptional()
    @IsBoolean()
    isDomainVerified?: boolean;

    @ApiPropertyOptional({ description: 'Filter by subscription active status' })
    @IsOptional()
    @IsBoolean()
    isSubscriptionActive?: boolean;

    @ApiPropertyOptional({ description: 'Filter by user count greater than' })
    @IsOptional()
    @IsInt()
    @Min(0)
    minUsers?: number;

    @ApiPropertyOptional({ description: 'Filter by user count less than' })
    @IsOptional()
    @IsInt()
    @Min(1)
    maxUsers?: number;

    @ApiPropertyOptional({ description: 'Filter by storage usage percentage' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    storageUsagePercentage?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeDto)
    createdAt?: DateRangeDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeDto)
    subscriptionDate?: DateRangeDto;

    @ApiPropertyOptional({ description: 'Filter by specific industries' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    industries?: string[];

    @ApiPropertyOptional({ description: 'Include deleted organizations' })
    @IsOptional()
    @IsBoolean()
    includeDeleted?: boolean;

    @ApiPropertyOptional({ description: 'Filter by specific location' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ description: 'Filter by timezone' })
    @IsOptional()
    @IsString()
    timezone?: string;

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
    @ApiPropertyOptional({ 
        description: 'Sort field',
        enum: ['name', 'createdAt', 'userCount', 'storageUsage', 'subscriptionEndDate']
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';

    // Relations and includes
    @ApiPropertyOptional({ description: 'Include user details' })
    @IsOptional()
    @IsBoolean()
    includeUsers?: boolean;

    @ApiPropertyOptional({ description: 'Include subscription details' })
    @IsOptional()
    @IsBoolean()
    includeSubscription?: boolean;

    @ApiPropertyOptional({ description: 'Include statistics' })
    @IsOptional()
    @IsBoolean()
    includeStatistics?: boolean;

    @ApiPropertyOptional({ description: 'Include audit logs' })
    @IsOptional()
    @IsBoolean()
    includeAuditLogs?: boolean;
}