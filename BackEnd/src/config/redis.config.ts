// src/config/redis.config.ts

import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { RedisOptions } from 'ioredis';

// Define CacheConfig interface explicitly to avoid type conflicts
interface CacheConfig {
  store: string;
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  max: number;
  ttlSeconds: number; // Renamed to avoid conflict with Redis ttl method
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

export const redisConfigValidationSchema = Joi.object({
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').optional(),
    REDIS_DB: Joi.number().default(0),
    REDIS_KEY_PREFIX: Joi.string().default('prm:'),
    REDIS_CONNECTION_TIMEOUT: Joi.number().default(10000),
    REDIS_MAX_RETRIES: Joi.number().default(10),
    REDIS_RETRY_MAX_DELAY: Joi.number().default(5000),
    REDIS_CACHE_TTL: Joi.number().default(3600),
    REDIS_CACHE_MAX: Joi.number().default(10000),
    REDIS_CLUSTER_ENABLED: Joi.boolean().default(false),
    REDIS_CLUSTER_NODES: Joi.string().when('REDIS_CLUSTER_ENABLED', {
        is: true,
        then: Joi.required(),
    }),
});

const redisConfig = registerAs('redis', (): RedisConfig => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'prm:',
    connectTimeout: parseInt(process.env.REDIS_CONNECTION_TIMEOUT || '10000', 10),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '10', 10),
    retryStrategy: {
        retries: parseInt(process.env.REDIS_MAX_RETRIES || '10', 10),
        maxDelay: parseInt(process.env.REDIS_RETRY_MAX_DELAY || '5000', 10),
    },
    cache: {
        cacheTtl: parseInt(process.env.REDIS_CACHE_TTL || '3600', 10),
        max: parseInt(process.env.REDIS_CACHE_MAX || '10000', 10),
    },
    cluster: {
        enabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
        nodes: process.env.REDIS_CLUSTER_NODES?.split(','),
    },
}));

export default redisConfig;

// Helper function to get config without accessing process.env directly
export const getRedisConfig = (): RedisConfig => {
    return redisConfig();
};

// Redis client options
export const getRedisOptions = (): RedisOptions => {
    const config = getRedisConfig();

    return {
        host: config.host,
        port: config.port,
        password: config.password,
        db: config.db,
        keyPrefix: config.keyPrefix,
        retryStrategy: (times: number) => {
            if (times > config.retryStrategy.retries) {
                return null;
            }
            return Math.min(times * 1000, config.retryStrategy.maxDelay);
        },
        maxRetriesPerRequest: config.maxRetriesPerRequest,
        connectTimeout: config.connectTimeout,
    };
};

// Cache configuration
export const getCacheConfig = (): CacheConfig => {
    const config = getRedisConfig();
    const redisOptions = getRedisOptions();
    
    return {
        store: 'redis',
        host: redisOptions.host || 'localhost',
        port: redisOptions.port || 6379,
        password: redisOptions.password,
        db: redisOptions.db || 0,
        keyPrefix: redisOptions.keyPrefix || '',
        max: config.cache.max,
        ttlSeconds: config.cache.cacheTtl, // Renamed to avoid conflict with Redis ttl method
    };
};

// Key patterns for different types of data
export const redisKeys = {
    userSession: (userId: string) => `session:${userId}`,
    refreshToken: (tokenId: string) => `refresh:${tokenId}`,
    userPermissions: (userId: string) => `permissions:${userId}`,
    rateLimit: (key: string) => `ratelimit:${key}`,
    cache: (key: string) => `cache:${key}`,
    lock: (key: string) => `lock:${key}`,
};

// Example .env file:
/*
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
REDIS_KEY_PREFIX=prm:
REDIS_CONNECTION_TIMEOUT=10000
REDIS_MAX_RETRIES=10
REDIS_RETRY_MAX_DELAY=5000
REDIS_CACHE_TTL=3600
REDIS_CACHE_MAX=10000
REDIS_CLUSTER_ENABLED=false
REDIS_CLUSTER_NODES=localhost:6379,localhost:6380
*/