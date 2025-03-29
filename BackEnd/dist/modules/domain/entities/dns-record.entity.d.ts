export declare enum DnsRecordType {
    A = "A",
    AAAA = "AAAA",
    CNAME = "CNAME",
    MX = "MX",
    TXT = "TXT",
    NS = "NS",
    SRV = "SRV",
    CAA = "CAA",
    PTR = "PTR",
    SOA = "SOA"
}
export declare class DnsRecord {
    id: string;
    domainId: string;
    domain: any;
    type: DnsRecordType;
    name: string;
    content: string;
    ttl: number;
    priority?: number;
    isActive: boolean;
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
    validation?: {
        isValid: boolean;
        lastChecked: Date;
        errors?: string[];
        warnings?: string[];
    };
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
    geolocation?: {
        enabled: boolean;
        regions?: string[];
        countries?: string[];
        continents?: string[];
        defaultResponse?: string;
    };
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
    tags?: string[];
    isSystem: boolean;
    isLocked: boolean;
    isProtected: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    history?: {
        action: string;
        timestamp: Date;
        performedBy?: string;
        oldValue?: string;
        newValue?: string;
        reason?: string;
    }[];
    notes?: string;
    isDeleted: boolean;
    deletedBy?: string;
    deletedAt?: Date;
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
