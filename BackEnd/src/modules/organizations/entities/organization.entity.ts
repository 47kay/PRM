import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum SubscriptionTier {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PROFESSIONAL = 'PROFESSIONAL',
    ENTERPRISE = 'ENTERPRISE'
}

export enum OrganizationStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    PENDING = 'PENDING'
}

@Entity('organizations')
@Index(['domain'])
export class Organization {
    [x: string]: any;
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 255, nullable: true })
    description: string;

    @Column({ length: 100, unique: true })
    @Index()
    slug: string;

    @Column({ length: 255, nullable: true })
    logo: string;

    @Column({ length: 100, nullable: true })
    domain: string;

    @Column({ default: false })
    isDomainVerified: boolean;

    @Column({
        type: 'enum',
        enum: OrganizationStatus,
        default: OrganizationStatus.PENDING
    })
    status: OrganizationStatus;

    @Column({
        type: 'enum',
        enum: SubscriptionTier,
        default: SubscriptionTier.FREE
    })
    subscriptionTier: SubscriptionTier;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionStartDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionEndDate: Date;

    @Column({ default: false })
    isSubscriptionActive: boolean;

    @Column({ type: 'jsonb', nullable: true })
    settings: {
        ticketPriorities?: string[];
        ticketCategories?: string[];
        customFields?: any[];
        notificationSettings?: any;
        brandingSettings?: any;
    };

    @Column({ type: 'int', default: 0 })
    maxUsers: number;

    @Column({ type: 'int', default: 0 })
    maxStorage: number; // in MB

    @Column({ nullable: true })
    createdById: string;


    @Column({ nullable: true })
    updatedById: string;

    @ManyToOne(() => User, { lazy: true })
    @JoinColumn({ name: 'createdById' })
    createdBy: Promise<User>;

    @ManyToOne(() => User, { lazy: true })
    @JoinColumn({ name: 'updatedById' })
    updatedBy: Promise<User>;

    // Relationships
    @OneToMany(() => User, user => user.organization, { lazy: true })
    users: Promise<User[]>;

    @OneToMany(() => Ticket, ticket => ticket.organization, { lazy: true })
    tickets: Promise<Ticket[]>;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    // Additional metadata columns
    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        industry?: string;
        size?: string;
        location?: string;
        timezone?: string;
        customAttributes?: Record<string, any>;
    };

    @Column({ type: 'jsonb', nullable: true })
    contactInfo: {
        email?: string;
        phone?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            country?: string;
            postalCode?: string;
        };
    };

    @Column({ type: 'simple-array', nullable: true })
    allowedDomains: string[];

    @Column({ default: true })
    isEmailVerificationRequired: boolean;

    @Column({ default: false })
    isTwoFactorAuthRequired: boolean;

    // Audit columns
    @Column({ type: 'jsonb', nullable: true })
    auditConfig: {
        enableAuditLog?: boolean;
        retentionPeriod?: number;
        logLevel?: string;
    };
}