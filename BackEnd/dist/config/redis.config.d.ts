import * as Joi from 'joi';
import { RedisOptions } from 'ioredis';
interface CacheConfig {
    store: string;
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
    max: number;
    ttlSeconds: number;
}
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
    connectTimeout: number;
    maxRetriesPerRequest: number;
    retryStrategy: {
        retries: number;
        maxDelay: number;
    };
    cache: {
        cacheTtl: number;
        max: number;
    };
    cluster: {
        enabled: boolean;
        nodes?: string[];
    };
}
export declare const redisConfigValidationSchema: Joi.ObjectSchema<any>;
declare const redisConfig: (() => RedisConfig) & import("@nestjs/config").ConfigFactoryKeyHost<RedisConfig>;
export default redisConfig;
export declare const getRedisConfig: () => RedisConfig;
export declare const getRedisOptions: () => RedisOptions;
export declare const getCacheConfig: () => CacheConfig;
export declare const redisKeys: {
    userSession: (userId: string) => string;
    refreshToken: (tokenId: string) => string;
    userPermissions: (userId: string) => string;
    rateLimit: (key: string) => string;
    cache: (key: string) => string;
    lock: (key: string) => string;
};
