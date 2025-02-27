import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditLogType {
    AUTHENTICATION = 'authentication',
    AUTHORIZATION = 'authorization',
    DATA_ACCESS = 'data_access',
    DATA_MODIFICATION = 'data_modification',
    SYSTEM = 'system',
    SECURITY = 'security',
    COMPLIANCE = 'compliance',
    BUSINESS = 'business'
}

export enum AuditLogSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

export enum AuditLogStatus {
    SUCCESS = 'success',
    FAILURE = 'failure',
    PENDING = 'pending',
    CANCELLED = 'cancelled'
}

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['actorType', 'actorId'])
@Index(['timestamp', 'type'])
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: AuditLogType,
        default: AuditLogType.SYSTEM
    })
    @Index()
    type: AuditLogType;

    @Column({
        type: 'enum',
        enum: AuditLogSeverity,
        default: AuditLogSeverity.INFO
    })
    @Index()
    severity: AuditLogSeverity;

    organizationId: string; // Add this line

    @Column({
        type: 'enum',
        enum: AuditLogStatus,
        default: AuditLogStatus.SUCCESS
    })
    @Index()
    status: AuditLogStatus;

    @Column()
    @Index()
    action: string;

    @Column('text')
    description: string;

    @Column('jsonb', { nullable: true })
    metadata: Record<string, any>;

    // Actor information (who performed the action)
    @Column('uuid', { nullable: true })
    actorId: string;

    @Column({ nullable: true })
    actorType: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'actorId' })
    actor: User;

    // Entity information (what was affected)
    @Column('uuid', { nullable: true })
    entityId: string;

    @Column({ nullable: true })
    entityType: string;

    @Column('jsonb', { nullable: true })
    changes: {
        before: Record<string, any>;
        after: Record<string, any>;
    };

    // Context information
    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    requestId: string;

    @Column({ nullable: true })
    sessionId: string;

    @Column('varchar', { nullable: true })
    origin: string;

    // Temporal information
    @CreateDateColumn()
    @Index()
    timestamp: Date;

    @Column({ nullable: true })
    duration: number;

    // Location information (if applicable)
    @Column('jsonb', { nullable: true })
    location: {
        country?: string;
        region?: string;
        city?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };

    // Security context
    @Column('jsonb', { nullable: true })
    securityContext: {
        permissions?: string[];
        roles?: string[];
        authenticationType?: string;
        authenticationMethod?: string;
        mfaUsed?: boolean;
    };

    // Compliance information
    @Column('jsonb', { nullable: true })
    complianceMetadata: {
        regulations?: string[];
        dataClassification?: string;
        retentionPeriod?: number;
        piiInvolved?: boolean;
        dlpPolicies?: string[];
    };

    // Error information (if applicable)
    @Column('jsonb', { nullable: true })
    error: {
        code?: string;
        message?: string;
        stack?: string;
        details?: Record<string, any>;
    };

    // Tags for better categorization and searching
    @Column('text', { array: true, nullable: true })
    @Index()
    tags: string[];

    // Risk assessment
    @Column('jsonb', { nullable: true })
    riskAssessment: {
        level?: 'low' | 'medium' | 'high' | 'critical';
        factors?: string[];
        score?: number;
        mitigations?: string[];
    };

    // Business context
    @Column('jsonb', { nullable: true })
    businessContext: {
        process?: string;
        department?: string;
        costCenter?: string;
        projectId?: string;
    };

    // System information
    @Column('jsonb', { nullable: true })
    systemContext: {
        environment?: string;
        version?: string;
        component?: string;
        hostname?: string;
    };

    // Temporal tracking
    @UpdateDateColumn()
    lastModified: Date;

    @Column({ nullable: true })
    expiresAt: Date;

    // Retention policy
    @Column({ default: false })
    @Index()
    archived: boolean;

    @Column({ nullable: true })
    archivedAt: Date;

    @Column({ default: false })
    @Index()
    redacted: boolean;

    @Column({ nullable: true })
    redactedAt: Date;

    // Additional metadata for specific use cases
    @Column('jsonb', { nullable: true })
    customMetadata: Record<string, any>;
}