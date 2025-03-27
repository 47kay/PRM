import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import type { Domain } from './domain.entity';
import { DomainVerificationStatus } from '../enums/domain-verification-status.enum';
import { DomainVerificationMethod } from '../enums/domain-verification-method.enum';

@Entity('domain_verification_tokens')
@Index(['domainId', 'token'])
@Index(['domainId', 'status'])
export class DomainVerificationToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    @Index()
    domainId: string;

    @ManyToOne('Domain', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'domainId' })
    domain: Domain;

    @Column()
    @Index()
    token: string;

    @Column({
        type: 'enum',
        enum: DomainVerificationMethod
    })
    method: DomainVerificationMethod;

    @Column({
        type: 'enum',
        enum: DomainVerificationStatus,
        default: DomainVerificationStatus.PENDING
    })
    @Index()
    status: DomainVerificationStatus;

    @Column('jsonb', { nullable: true })
    verificationRecord: {
        type: string;
        name: string;
        value: string;
        ttl?: number;
    };

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    verifiedAt?: Date;

    @Column('int', { default: 0 })
    attempts: number;

    @Column({ nullable: true })
    lastAttemptAt?: Date;

    @Column('jsonb', { nullable: true })
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

    @Column('jsonb', { nullable: true })
    metadata?: {
        generatedBy?: string;
        source?: string;
        clientIp?: string;
        userAgent?: string;
    };

    @Column('boolean', { default: false })
    isRevoked: boolean;

    @Column({ nullable: true })
    revokedAt?: Date;

    @Column('uuid', { nullable: true })
    revokedBy?: string;

    @Column('text', { nullable: true })
    revokeReason?: string;

    @Column('jsonb', { nullable: true })
    retryPolicy?: {
        maxAttempts: number;
        backoffPeriod: number;
        timeoutPeriod: number;
    };

    @Column('boolean', { default: true })
    isActive: boolean;

    @Column('jsonb', { nullable: true })
    validationRules?: {
        requiredRecords?: string[];
        propagationTime?: number;
        requiredNameservers?: string[];
    };

    @Column('text', { array: true, nullable: true })
    alternativeTokens?: string[];

    @Column('jsonb', { nullable: true })
    customValidation?: {
        type: string;
        config: Record<string, any>;
        results?: Record<string, any>;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('uuid', { nullable: true })
    createdBy?: string;

    @Column('uuid', { nullable: true })
    updatedBy?: string;

    @Column('jsonb', { nullable: true })
    history?: {
        action: string;
        timestamp: Date;
        performedBy?: string;
        details?: Record<string, any>;
        status?: DomainVerificationStatus;
    }[];

    @Column('text', { nullable: true })
    notes?: string;
}