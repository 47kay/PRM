import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('organization_audit_logs')
export class OrganizationAuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    @Index()
    organizationId: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column()
    @Index()
    eventType: string;

    @Column('jsonb')
    data: Record<string, any>;

    @Column('uuid')
    @Index()
    performedBy: string;

    @CreateDateColumn()
    @Index()
    timestamp: Date;

    @Column('jsonb', { nullable: true })
    metadata?: Record<string, any>;

    @Column({ nullable: true })
    ipAddress?: string;

    @Column({ nullable: true })
    userAgent?: string;

    @Column('varchar', { length: 50, nullable: true })
    @Index()
    resourceType?: string;

    @Column('uuid', { nullable: true })
    @Index()
    resourceId?: string;

    @Column('varchar', { length: 50, nullable: true })
    @Index()
    actionType?: string;

    @Column('varchar', { length: 50, nullable: true })
    @Index()
    status?: 'success' | 'failure' | 'pending';

    @Column('text', { nullable: true })
    errorMessage?: string;

    @Column('jsonb', { nullable: true })
    changes?: {
        before: Record<string, any>;
        after: Record<string, any>;
    };

    @Column('text', { array: true, nullable: true })
    tags?: string[];

    @Column('boolean', { default: false })
    isSensitive: boolean;

    @Column('int', { nullable: true })
    duration?: number; // Duration of the operation in milliseconds

    @Column('varchar', { length: 100, nullable: true })
    sessionId?: string;

    @Column('varchar', { length: 100, nullable: true })
    requestId?: string;

    @Column('varchar', { length: 50, nullable: true })
    environment?: string;

    @Column('varchar', { length: 50, nullable: true })
    version?: string;

    // Denormalized fields for better query performance
    @Column('varchar', { length: 255, nullable: true })
    @Index()
    performedByEmail?: string;

    @Column('varchar', { length: 100, nullable: true })
    @Index()
    performedByRole?: string;

    @Column('varchar', { length: 255, nullable: true })
    @Index()
    resourceName?: string;

    // Optional cascade delete configuration
    @Column('boolean', { default: false })
    retainOnDelete?: boolean;

    // Additional metadata for compliance
    @Column('jsonb', { nullable: true })
    complianceMetadata?: {
        dataRetentionPeriod?: number;
        dataClassification?: string;
        regulatoryRequirements?: string[];
        piiInvolved?: boolean;
    };
}