import type { Domain } from './domain.entity';
import { DomainVerificationStatus } from '../enums/domain-verification-status.enum';
import { DomainVerificationMethod } from '../enums/domain-verification-method.enum';
export declare class DomainVerificationToken {
    id: string;
    domainId: string;
    domain: Domain;
    token: string;
    method: DomainVerificationMethod;
    status: DomainVerificationStatus;
    verificationRecord: {
        type: string;
        name: string;
        value: string;
        ttl?: number;
    };
    expiresAt: Date;
    verifiedAt?: Date;
    attempts: number;
    lastAttemptAt?: Date;
    verificationResults?: {
        success: boolean;
        checkedAt: Date;
        error?: string;
        details?: {
            foundRecords?: string[];
            matchStatus?: string;
            propagationStatus?: string;
            nameservers?: string[];
        };
    }[];
    metadata?: {
        generatedBy?: string;
        source?: string;
        clientIp?: string;
        userAgent?: string;
    };
    isRevoked: boolean;
    revokedAt?: Date;
    revokedBy?: string;
    revokeReason?: string;
    retryPolicy?: {
        maxAttempts: number;
        backoffPeriod: number;
        timeoutPeriod: number;
    };
    isActive: boolean;
    validationRules?: {
        requiredRecords?: string[];
        propagationTime?: number;
        requiredNameservers?: string[];
    };
    alternativeTokens?: string[];
    customValidation?: {
        type: string;
        config: Record<string, any>;
        results?: Record<string, any>;
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    history?: {
        action: string;
        timestamp: Date;
        performedBy?: string;
        details?: Record<string, any>;
        status?: DomainVerificationStatus;
    }[];
    notes?: string;
}
