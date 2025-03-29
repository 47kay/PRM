import * as Joi from 'joi';
export interface JwtConfig {
    secret: string;
    accessToken: {
        expiresIn: number;
        algorithm: string;
        issuer: string;
        audience: string;
    };
    refreshToken: {
        expiresIn: number;
        algorithm: string;
        issuer: string;
        audience: string;
    };
    verifyOptions: {
        ignoreExpiration: boolean;
        ignoreNotBefore: boolean;
    };
}
export declare const jwtConfigValidationSchema: Joi.ObjectSchema<any>;
declare const _default: (() => JwtConfig) & import("@nestjs/config").ConfigFactoryKeyHost<JwtConfig>;
export default _default;
export declare const jwtModuleConfig: {
    secret: string;
    signOptions: {
        expiresIn: string;
        algorithm: string;
        issuer: string;
        audience: string;
    };
    verifyOptions: {
        ignoreExpiration: boolean;
        ignoreNotBefore: boolean;
    };
};
