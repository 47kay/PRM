// src/config/redis.config.ts

import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { RedisOptions } from 'ioredis';

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
    connectionTimeout: number;
    maxRetriesPerRequest: number;
    retryStrategy: {
        retries: number;
        maxDelay: number;
    };
    cache: {
        ttl: number;
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

export default registerAs('redis', (): RedisConfig => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'prm:',
    connectionTimeout: parseInt(process.env.REDIS_CONNECTION_TIMEOUT || '10000', 10),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '10', 10),
    retryStrategy: {
        retries: parseInt(process.env.REDIS_MAX_RETRIES || '10', 10),
        maxDelay: parseInt(process.env.REDIS_RETRY_MAX_DELAY || '5000', 10),
    },
    cache: {
        ttl: parseInt(process.env.REDIS_CACHE_TTL || '3600', 10),
        max: parseInt(process.env.REDIS_CACHE_MAX || '10000', 10),
    },
    cluster: {
        enabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
        nodes: process.env.REDIS_CLUSTER_NODES?.split(','),
    },
}));

// Redis client options
export const getRedisOptions = (): RedisOptions => {
    const config = defaultConfig();

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
        connectionTimeout: config.connectionTimeout,
    };
};

// Cache configuration
export const getCacheConfig = () => {
    const config = defaultConfig();
    return {
        store: 'redis',
        ...getRedisOptions(),
        ttl: config.cache.ttl,
        max: config.cache.max,
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