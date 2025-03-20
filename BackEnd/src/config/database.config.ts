// src/config/database.config.ts

import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    schema: string;
    ssl: boolean;
    synchronize: boolean;
    logging: boolean;
    maxConnections: number;
    minConnections: number;
    connectionTimeout: number;
    retryAttempts: number;
    retryDelay: number;
    migrations: {
        enabled: boolean;
        directory: string;
        tableName: string;
    };
}

export const databaseConfigValidationSchema = Joi.object({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_SCHEMA: Joi.string().default('public'),
    DB_SSL: Joi.boolean().default(false),
    DB_SYNC: Joi.boolean().default(false),
    DB_LOGGING: Joi.boolean().default(false),
    DB_MAX_CONNECTIONS: Joi.number().default(100),
    DB_MIN_CONNECTIONS: Joi.number().default(1),
    DB_CONNECTION_TIMEOUT: Joi.number().default(10000),
    DB_RETRY_ATTEMPTS: Joi.number().default(10),
    DB_RETRY_DELAY: Joi.number().default(3000),
    DB_MIGRATIONS_ENABLED: Joi.boolean().default(true),
    DB_MIGRATIONS_DIR: Joi.string().default('src/database/migrations'),
    DB_MIGRATIONS_TABLE: Joi.string().default('migrations'),
});

const config = registerAs('database', (): DatabaseConfig => ({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    schema: process.env.DB_SCHEMA || 'public',
    ssl: process.env.DB_SSL === 'true',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '100', 10),
    minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '1', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '10', 10),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10),
    migrations: {
        enabled: process.env.DB_MIGRATIONS_ENABLED === 'true',
        directory: process.env.DB_MIGRATIONS_DIR || 'src/database/migrations',
        tableName: process.env.DB_MIGRATIONS_TABLE || 'migrations',
    },
}));

export default config;

// TypeORM configuration factory
export const typeOrmConfig = async (): Promise<TypeOrmModuleOptions> => {
    const dbConfig = config();

    return {
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        schema: dbConfig.schema,
        ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
        synchronize: dbConfig.synchronize,
        logging: dbConfig.logging,
        entities: ['dist/**/*.entity.js'],
        migrations: [`${dbConfig.migrations.directory}/*.{ts,js}`],
        migrationsTableName: dbConfig.migrations.tableName,
        migrationsRun: dbConfig.migrations.enabled,
        poolSize: dbConfig.maxConnections,
        connectTimeoutMS: dbConfig.connectionTimeout,
        extra: {
            max: dbConfig.maxConnections,
            min: dbConfig.minConnections,
        },
        autoLoadEntities: true,
    };
};

// Create a non-async version of typeOrmConfig for the DataSource
export const typeOrmConfigSync = (): DataSourceOptions => {
    const dbConfig = config();

    return {
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        schema: dbConfig.schema,
        ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
        synchronize: dbConfig.synchronize,
        logging: dbConfig.logging,
        entities: ['src/**/*.entity.ts'],
        migrations: [`${dbConfig.migrations.directory}/*.ts`],
        migrationsTableName: dbConfig.migrations.tableName,
        migrationsRun: dbConfig.migrations.enabled,
        extra: {
            max: dbConfig.maxConnections,
            min: dbConfig.minConnections,
            connectionTimeout: dbConfig.connectionTimeout,
        },
    };
};

// Data source for TypeORM CLI
export const dataSource = new DataSource(typeOrmConfigSync());

// Example .env file:
/*
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=prm_db
DB_SCHEMA=public
DB_SSL=false
DB_SYNC=false
DB_LOGGING=true
DB_MAX_CONNECTIONS=100
DB_MIN_CONNECTIONS=1
DB_CONNECTION_TIMEOUT=10000
DB_RETRY_ATTEMPTS=10
DB_RETRY_DELAY=3000
DB_MIGRATIONS_ENABLED=true
DB_MIGRATIONS_DIR=src/database/migrations
DB_MIGRATIONS_TABLE=migrations
*/