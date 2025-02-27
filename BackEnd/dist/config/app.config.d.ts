import * as Joi from 'joi';
export interface AppConfig {
    nodeEnv: string;
    name: string;
    host: string;
    port: number;
    apiPrefix: string;
    apiVersion: string;
    frontendUrl: string;
    docsEnabled: boolean;
    rateLimiting: {
        ttl: number;
        limit: number;
    };
    cors: {
        enabled: boolean;
        origins: string[];
    };
    logging: {
        level: string;
        console: boolean;
        file: boolean;
    };
}
export declare const appConfigValidationSchema: Joi.ObjectSchema<any>;
declare const _default: (() => AppConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AppConfig>;
export default _default;
