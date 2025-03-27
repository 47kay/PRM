// src/modules/sms/sms.module.ts

import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsTemplateService } from './services/sms-template.service';
import { SmsTemplate } from './entities/sms-template.entity';
import { SmsLog } from './entities/sms-log.entity';
import { SmsService } from './services/sms.service';

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



@Module({
  imports: [
    TypeOrmModule.forFeature([SmsTemplate, SmsLog]),
    ConfigModule,
  ],
  providers: [
    SmsService,
    SmsTemplateService,
  ],
  exports: [
    SmsService,
    SmsTemplateService,
  ],
})
export class SmsModule {
  static forRoot(options: SmsModuleOptions): DynamicModule {
    return {
      module: SmsModule,
      providers: [
        {
          provide: 'SMS_MODULE_OPTIONS',
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => SmsModuleOptions | Promise<SmsModuleOptions>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: SmsModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'SMS_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
    };
  }

  static register(options: SmsModuleOptions): DynamicModule {
    return {
      module: SmsModule,
      providers: [
        {
          provide: 'SMS_MODULE_OPTIONS',
          useValue: options,
        },
      ],
    };
  }
}