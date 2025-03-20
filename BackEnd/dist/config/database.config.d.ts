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
export declare const databaseConfigValidationSchema: Joi.ObjectSchema<any>;
declare const config: (() => DatabaseConfig) & import("@nestjs/config").ConfigFactoryKeyHost<DatabaseConfig>;
export default config;
export declare const typeOrmConfig: () => Promise<TypeOrmModuleOptions>;
export declare const typeOrmConfigSync: () => DataSourceOptions;
export declare const dataSource: DataSource;
