import { DynamicModule } from '@nestjs/common';
export interface EmailModuleOptions {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'aws-ses';
    from?: string;
    replyTo?: string;
    smtpOptions?: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    sendgridOptions?: {
        apiKey: string;
    };
    mailgunOptions?: {
        apiKey: string;
        domain: string;
    };
    awsSesOptions?: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
    };
    defaultTemplateDir?: string;
}
export declare class EmailModule {
    static forRoot(options: EmailModuleOptions): DynamicModule;
    static forRootAsync(options: {
        imports?: any[];
        useFactory: (...args: any[]) => EmailModuleOptions | Promise<EmailModuleOptions>;
        inject?: any[];
    }): DynamicModule;
    static register(options: EmailModuleOptions): DynamicModule;
}
