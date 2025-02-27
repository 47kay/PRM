import { OrganizationStatus, SubscriptionTier } from '../entities/organization.entity';
export declare class DateRangeDto {
    startDate?: string;
    endDate?: string;
}
export declare class OrganizationQueryDto {
    search?: string;
    status?: OrganizationStatus;
    subscriptionTier?: SubscriptionTier;
    isDomainVerified?: boolean;
    isSubscriptionActive?: boolean;
    minUsers?: number;
    maxUsers?: number;
    storageUsagePercentage?: number;
    createdAt?: DateRangeDto;
    subscriptionDate?: DateRangeDto;
    industries?: string[];
    includeDeleted?: boolean;
    location?: string;
    timezone?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    includeUsers?: boolean;
    includeSubscription?: boolean;
    includeStatistics?: boolean;
    includeAuditLogs?: boolean;
}
