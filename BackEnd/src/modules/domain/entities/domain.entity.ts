import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { DomainVerificationStatus } from '../enums/domain-verification-status.enum';
import { DomainStatus } from '../enums/domain-status.enum';
import { DnsRecord } from './dns-record.entity';

@Entity('domains')
export class Domain {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index({ unique: true })
    name: string;

    @Column('uuid')
    @Index()
    organizationId: string;

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column({
        type: 'enum',
        enum: DomainStatus,
        default: DomainStatus.PENDING
    })
    @Index()
    status: DomainStatus;

    @Column({
        type: 'enum',
        enum: DomainVerificationStatus,
        default: DomainVerificationStatus.PENDING
    })
    @Index()
    verificationStatus: DomainVerificationStatus;

    // Use string literal to break circular dependency
    @OneToMany('DomainVerificationToken', 'domain')
    verificationTokens: any[]; // Use any[] instead of specific type

    @OneToMany('DnsRecord', 'domain')
    dnsRecords: any[];

    @Column({ nullable: true })
    verifiedAt?: Date;

    @Column('jsonb', { nullable: true })
    verificationDetails?: {
        method: string;
        value: string;
        checkedAt: Date;
        attempts: number;
        lastAttemptAt?: Date;
        error?: string;
    };

    @Column('boolean', { default: true })
    isDefault: boolean;

    @Column('boolean', { default: false })
    isPrimary: boolean;

    @Column('jsonb', { nullable: true })
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

    @Column('jsonb', { nullable: true })
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

    @Column('date', { nullable: true })
    expiresAt?: Date;

    @Column('date', { nullable: true })
    renewalDate?: Date;

    @Column('boolean', { default: false })
    @Index()
    isExpired: boolean;

    @Column('boolean', { default: false })
    @Index()
    isLocked: boolean;

    @Column('jsonb', { nullable: true })
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

    @Column('jsonb', { nullable: true })
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

    @Column('jsonb', { nullable: true })
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

    @Column('text', { array: true, nullable: true })
    @Index()
    tags?: string[];

    @Column('jsonb', { nullable: true })
    usage?: {
        emailEnabled?: boolean;
        webEnabled?: boolean;
        services?: string[];
    };

    @Column('jsonb', { nullable: true })
    securitySettings?: {
        transferLock?: boolean;
        registrarLock?: boolean;
        dnssec?: {
            enabled: boolean;
            keys?: string[];
        };
        twoFactorAuth?: boolean;
    };

    @Column('jsonb', { nullable: true })
    compliance?: {
        gdpr?: {
            compliant: boolean;
            lastCheck?: Date;
            issues?: string[];
        };
        privacyShield?: boolean;
        industryStandards?: string[];
    };

    @Column('jsonb', { nullable: true })
    analytics?: {
        lastUpdated?: Date;
        metrics?: {
            emailVolume?: number;
            webTraffic?: number;
            bounceRate?: number;
        };
    };

    @Column('text', { nullable: true })
    notes?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('uuid', { nullable: true })
    createdBy?: string;

    @Column('uuid', { nullable: true })
    updatedBy?: string;

    @Column('boolean', { default: false })
    @Index()
    isDeleted: boolean;

    @Column('uuid', { nullable: true })
    deletedBy?: string;

    @Column({ nullable: true })
    deletedAt?: Date;

    @Column('jsonb', { nullable: true })
    history?: {
        event: string;
        timestamp: Date;
        userId: string;
        details?: any;
    }[];
}