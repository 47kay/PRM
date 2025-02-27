import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsDate,
    IsInt,
    IsOptional,
    IsBoolean,
    IsString,
    IsObject,
    Min,
    Max,
    ValidateNested,
    IsDateString,
    IsNumber
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionTier } from '../entities/organization.entity';

export class BillingDetailsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    billingEmail?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    billingAddress?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    taxId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    paymentMethod?: string;
}

export class FeatureLimitsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    maxProjects?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    maxTeams?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    maxIntegrations?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    maxCustomFields?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    maxApiCalls?: number;
}

export class UpdateSubscriptionDto {
    @ApiProperty({ enum: SubscriptionTier, description: 'Subscription tier level' })
    @IsEnum(SubscriptionTier)
    tier: SubscriptionTier;

    @ApiProperty({ description: 'Subscription start date' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ description: 'Subscription end date' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ description: 'Maximum number of users allowed' })
    @IsInt()
    @Min(1)
    @Max(10000)
    maxUsers: number;

    @ApiProperty({ description: 'Maximum storage in MB' })
    @IsInt()
    @Min(1)
    maxStorage: number;

    @ApiPropertyOptional({ description: 'Auto-renewal enabled' })
    @IsOptional()
    @IsBoolean()
    autoRenew?: boolean;

    @ApiPropertyOptional({ description: 'Trial period enabled' })
    @IsOptional()
    @IsBoolean()
    isTrial?: boolean;

    @ApiPropertyOptional({ description: 'Trial end date' })
    @IsOptional()
    @IsDateString()
    trialEndDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => BillingDetailsDto)
    billingDetails?: BillingDetailsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => FeatureLimitsDto)
    featureLimits?: FeatureLimitsDto;

    @ApiPropertyOptional({ description: 'Billing cycle in months' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    billingCycle?: number;

    @ApiPropertyOptional({ description: 'Price per user' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    pricePerUser?: number;

    @ApiPropertyOptional({ description: 'Base price for subscription' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    basePrice?: number;

    @ApiPropertyOptional({ description: 'Discount percentage' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercentage?: number;

    @ApiPropertyOptional({ description: 'Custom features enabled' })
    @IsOptional()
    @IsObject()
    features?: {
        customDomain?: boolean;
        ssoEnabled?: boolean;
        apiAccess?: boolean;
        advancedReporting?: boolean;
        customBranding?: boolean;
        prioritySupport?: boolean;
        dataExport?: boolean;
        auditLogs?: boolean;
    };

    @ApiPropertyOptional({ description: 'Additional customization options' })
    @IsOptional()
    @IsObject()
    customization?: {
        theme?: string;
        modules?: string[];
        restrictions?: string[];
        customFields?: any[];
    };

    @ApiPropertyOptional({ description: 'Support level included' })
    @IsOptional()
    @IsEnum(['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'])
    supportLevel?: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}