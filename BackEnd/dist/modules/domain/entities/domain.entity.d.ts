import { Organization } from '../../organizations/entities/organization.entity';
import { DomainVerificationStatus } from '../enums/domain-verification-status.enum';
import { DomainStatus } from '../enums/domain-status.enum';
export declare class Domain {
    id: string;
    name: string;
    organizationId: string;
    organization: Organization;
    status: DomainStatus;
    verificationStatus: DomainVerificationStatus;
    verificationTokens: any[];
    dnsRecords: any[];
    verifiedAt?: Date;
    verificationDetails?: {
        method: string;
        value: string;
        checkedAt: Date;
        attempts: number;
        lastAttemptAt?: Date;
        error?: string;
    };
    isDefault: boolean;
    isPrimary: boolean;
    dnsConfiguration?: {
        mx?: {
            records: string[];
            verified: boolean;
            lastChecked?: Date;
        };
        spf?: {
            record: string;
            verified: boolean;
            lastChecked?: Date;
        };
        dkim?: {
            selector: string;
            publicKey: string;
            verified: boolean;
            lastChecked?: Date;
        };
        dmarc?: {
            record: string;
            verified: boolean;
            lastChecked?: Date;
        };
    };
    settings?: {
        customNameservers?: string[];
        autoRenew?: boolean;
        lockEnabled?: boolean;
        privacyEnabled?: boolean;
        emailForwarding?: {
            enabled: boolean;
            rules?: {
                from: string;
                to: string[];
                active: boolean;
            }[];
        };
    };
    expiresAt?: Date;
    renewalDate?: Date;
    isExpired: boolean;
    isLocked: boolean;
    registrarInfo?: {
        registrar: string;
        registrarId?: string;
        whoisServer?: string;
        referralUrl?: string;
        createdDate?: Date;
        updatedDate?: Date;
        registrantContact?: {
            name?: string;
            organization?: string;
            email?: string;
            phone?: string;
        };
    };
    sslCertificate?: {
        provider?: string;
        issuer?: string;
        validFrom?: Date;
        validTo?: Date;
        type?: string;
        status?: string;
        autoRenew?: boolean;
        lastRenewal?: Date;
    };
    monitoring?: {
        enabled: boolean;
        lastCheck?: Date;
        status?: string;
        uptime?: number;
        alerts?: {
            email?: string[];
            webhook?: string[];
        };
    };
    tags?: string[];
    usage?: {
        emailEnabled?: boolean;
        webEnabled?: boolean;
        services?: string[];
    };
    securitySettings?: {
        transferLock?: boolean;
        registrarLock?: boolean;
        dnssec?: {
            enabled: boolean;
            keys?: string[];
        };
        twoFactorAuth?: boolean;
    };
    compliance?: {
        gdpr?: {
            compliant: boolean;
            lastCheck?: Date;
            issues?: string[];
        };
        privacyShield?: boolean;
        industryStandards?: string[];
    };
    analytics?: {
        lastUpdated?: Date;
        metrics?: {
            emailVolume?: number;
            webTraffic?: number;
            bounceRate?: number;
        };
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    isDeleted: boolean;
    deletedBy?: string;
    deletedAt?: Date;
    history?: {
        event: string;
        timestamp: Date;
        userId: string;
        details?: any;
    }[];
}
