import { SubscriptionTier } from '../entities/organization.entity';
export declare class BillingDetailsDto {
    billingEmail?: string;
    billingAddress?: string;
    taxId?: string;
    paymentMethod?: string;
}
export declare class FeatureLimitsDto {
    maxProjects?: number;
    maxTeams?: number;
    maxIntegrations?: number;
    maxCustomFields?: number;
    maxApiCalls?: number;
}
export declare class UpdateSubscriptionDto {
    tier: SubscriptionTier;
    startDate: string;
    endDate: string;
    maxUsers: number;
    maxStorage: number;
    autoRenew?: boolean;
    isTrial?: boolean;
    trialEndDate?: string;
    billingDetails?: BillingDetailsDto;
    featureLimits?: FeatureLimitsDto;
    billingCycle?: number;
    pricePerUser?: number;
    basePrice?: number;
    discountPercentage?: number;
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
    customization?: {
        theme?: string;
        modules?: string[];
        restrictions?: string[];
        customFields?: any[];
    };
    supportLevel?: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
    metadata?: Record<string, any>;
}
