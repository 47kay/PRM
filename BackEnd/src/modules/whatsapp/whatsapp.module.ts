// src/modules/whatsapp/whatsapp.module.ts

import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './services/whatsapp.services';
import { WhatsappTemplateService } from './services/whatsapp-template.service';
import { WhatsappTemplate } from './entities/whatsapp-template.entity';
import { WhatsappLog } from './entities/whatsapp-log.entity';

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

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappTemplate, WhatsappLog]),
    ConfigModule,
  ],
  providers: [
    WhatsappService,
    WhatsappTemplateService,
  ],
  exports: [
    WhatsappService,
    WhatsappTemplateService,
  ],
})
export class WhatsappModule {
  static forRoot(options: WhatsappModuleOptions): DynamicModule {
    return {
      module: WhatsappModule,
      providers: [
        {
          provide: 'WHATSAPP_MODULE_OPTIONS',
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => WhatsappModuleOptions | Promise<WhatsappModuleOptions>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: WhatsappModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'WHATSAPP_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
    };
  }

  static register(options: WhatsappModuleOptions): DynamicModule {
    return {
      module: WhatsappModule,
      providers: [
        {
          provide: 'WHATSAPP_MODULE_OPTIONS',
          useValue: options,
        },
      ],
    };
  }
}