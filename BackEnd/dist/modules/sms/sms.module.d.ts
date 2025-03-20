import { DynamicModule } from '@nestjs/common';
export interface SmsModuleOptions {
    provider: 'twilio' | 'nexmo' | 'africas-talking' | 'aws-sns';
    twilioOptions?: {
        accountSid: string;
        authToken: string;
        fromNumber: string;
    };
    nexmoOptions?: {
        apiKey: string;
        apiSecret: string;
        fromNumber: string;
    };
    africasTalkingOptions?: {
        username: string;
        apiKey: string;
        from: string;
    };
    awsSnsOptions?: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
    };
    defaultSender?: string;
}
export declare class SmsModule {
    static forRoot(options: SmsModuleOptions): DynamicModule;
    static forRootAsync(options: {
        imports?: any[];
        useFactory: (...args: any[]) => SmsModuleOptions | Promise<SmsModuleOptions>;
        inject?: any[];
    }): DynamicModule;
    static register(options: SmsModuleOptions): DynamicModule;
}
