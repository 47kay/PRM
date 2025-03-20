import * as Joi from 'joi';
import { OpenAPIObject, SwaggerCustomOptions } from '@nestjs/swagger';
export interface SwaggerConfig {
    enabled: boolean;
    title: string;
    description: string;
    version: string;
    path: string;
    auth: {
        enabled: boolean;
        username: string;
        password: string;
    };
    tags: string[];
    servers: {
        url: string;
        description: string;
    }[];
}
export declare const swaggerConfigValidationSchema: Joi.ObjectSchema<any>;
declare const swaggerConfig: (() => SwaggerConfig) & import("@nestjs/config").ConfigFactoryKeyHost<SwaggerConfig>;
export default swaggerConfig;
export declare const getSwaggerConfig: () => SwaggerConfig;
export declare const createSwaggerDocument: () => Partial<OpenAPIObject>;
export declare const swaggerCustomOptions: SwaggerCustomOptions;
export declare const swaggerSecurityConfig: (app: any) => void;
