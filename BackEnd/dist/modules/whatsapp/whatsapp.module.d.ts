import { DynamicModule } from '@nestjs/common';
export interface WhatsappModuleOptions {
    provider: 'twilio' | 'facebook' | 'waba' | 'messagebird';
    enabled: boolean;
    twilioOptions?: {
        accountSid: string;
        authToken: string;
        fromNumber: string;
    };
    facebookOptions?: {
        apiVersion: string;
        accessToken: string;
        phoneNumberId: string;
    };
    wabaOptions?: {
        accessToken: string;
        phoneNumberId: string;
        businessAccountId: string;
    };
    messagebirdOptions?: {
        accessKey: string;
        channelId: string;
        namespace: string;
    };
    defaultTemplateLanguage?: string;
}
export declare class WhatsappModule {
    static forRoot(options: WhatsappModuleOptions): DynamicModule;
    static forRootAsync(options: {
        imports?: any[];
        useFactory: (...args: any[]) => WhatsappModuleOptions | Promise<WhatsappModuleOptions>;
        inject?: any[];
    }): DynamicModule;
    static register(options: WhatsappModuleOptions): DynamicModule;
}
