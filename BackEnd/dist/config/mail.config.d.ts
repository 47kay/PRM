import * as Joi from 'joi';
import { MailerOptions } from '@nestjs-modules/mailer';
export interface MailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    defaults: {
        from: string;
    };
    template: {
        dir: string;
        adapter: any;
        options: {
            strict: boolean;
        };
    };
    queueing: {
        enabled: boolean;
        retryAttempts: number;
        retryDelay: number;
        concurrency: number;
    };
    rateLimit: {
        enabled: boolean;
        maxPerHour: number;
    };
}
export declare const mailConfigValidationSchema: Joi.ObjectSchema<any>;
declare const mailConfig: (() => MailConfig) & import("@nestjs/config").ConfigFactoryKeyHost<MailConfig>;
export default mailConfig;
export declare const getMailConfig: () => MailConfig;
export declare const mailerConfig: () => MailerOptions;
export interface EmailTemplate {
    subject: string;
    template: string;
    context: Record<string, any>;
}
export declare const emailTemplates: {
    welcome: (name: string) => EmailTemplate;
    resetPassword: (token: string) => EmailTemplate;
    appointmentReminder: (appointment: any) => EmailTemplate;
    appointmentConfirmation: (appointment: any) => EmailTemplate;
};
