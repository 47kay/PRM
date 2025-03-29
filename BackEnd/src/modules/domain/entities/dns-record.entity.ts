import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
// Change to type-only import to break circular dependency
import type { Domain } from './domain.entity';

export enum DnsRecordType {
    A = 'A',
    AAAA = 'AAAA',
    CNAME = 'CNAME',
    MX = 'MX',
    TXT = 'TXT',
    NS = 'NS',
    SRV = 'SRV',
    CAA = 'CAA',
    PTR = 'PTR',
    SOA = 'SOA'
}

@Entity('dns_records')
@Index(['domainId', 'type'])
@Index(['domainId', 'name'])
export class DnsRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    @Index()
    domainId: string;

    @ManyToOne('Domain', 'dnsRecords', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'domainId' })
    domain: any;

    @Column({
        type: 'enum',
        enum: DnsRecordType
    })
    @Index()
    type: DnsRecordType;

    @Column()
    @Index()
    name: string;

    @Column('text')
    content: string;

    @Column('int', { default: 3600 })
    ttl: number;

    @Column('int', { nullable: true })
    priority?: number;

    @Column('boolean', { default: true })
    isActive: boolean;

    @Column('jsonb', { nullable: true })
    metadata?: {
        proxied?: boolean;
        cloudflare?: {
            proxied?: boolean;
            proxiedAt?: Date;
            developmentMode?: boolean;
        };
        aws?: {
            regionId?: string;
            healthCheckId?: string;
            evaluateTargetHealth?: boolean;
        };
        google?: {
            routingPolicy?: string;
            healthChecked?: boolean;
        };
        azure?: {
            trafficManagerProfile?: string;
            weight?: number;
        };
    };

    @Column('jsonb', { nullable: true })
    validation?: {
        isValid: boolean;
        lastChecked: Date;
        errors?: string[];
        warnings?: string[];
    };

    @Column('jsonb', { nullable: true })
    monitoring?: {
        enabled: boolean;
        lastCheck?: Date;
        status?: 'up' | 'down' | 'degraded';
        responseTime?: number;
        healthCheckId?: string;
        alerts?: {
            email?: string[];
            webhook?: string[];
        };
    };

    @Column('jsonb', { nullable: true })
    geolocation?: {
        enabled: boolean;
        regions?: string[];
        countries?: string[];
        continents?: string[];
        defaultResponse?: string;
    };

    @Column('jsonb', { nullable: true })
    loadBalancing?: {
        enabled: boolean;
        method?: 'round-robin' | 'weighted' | 'latency' | 'geo';
        pools?: {
            id: string;
            name: string;
            endpoints: string[];
            weight?: number;
            enabled: boolean;
        }[];
    };

    @Column('jsonb', { nullable: true })
    failover?: {
        enabled: boolean;
        primary?: string;
        secondary?: string;
        healthCheck?: {
            type: string;
            interval: number;
            timeout: number;
            retries: number;
        };
    };

    @Column('text', { array: true, nullable: true })
    tags?: string[];

    @Column('boolean', { default: false })
    isSystem: boolean;

    @Column('boolean', { default: false })
    isLocked: boolean;

    @Column('boolean', { default: false })
    isProtected: boolean;

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
        oldValue?: string;
        newValue?: string;
        reason?: string;
    }[];

    @Column('text', { nullable: true })
    notes?: string;

    @Column('boolean', { default: false })
    @Index()
    isDeleted: boolean;

    @Column('uuid', { nullable: true })
    deletedBy?: string;

    @Column({ nullable: true })
    deletedAt?: Date;

    @Column('jsonb', { nullable: true })
    propagation?: {
        status: 'pending' | 'in_progress' | 'completed' | 'failed';
        startedAt?: Date;
        completedAt?: Date;
        nameservers?: {
            server: string;
            status: string;
            checkedAt: Date;
        }[];
    };

    @Column('jsonb', { nullable: true })
    analytics?: {
        lastUpdated?: Date;
        queries?: {
            total: number;
            timeframe: string;
            distribution?: Record<string, number>;
        };
        performance?: {
            responseTime: number;
            availability: number;
        };
    };
}