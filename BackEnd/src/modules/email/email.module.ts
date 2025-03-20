// src/modules/email/email.module.ts

import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { EmailTemplateService } from './services/email-template.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailLog } from './entities/email-log.entity';

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

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate, EmailLog]),
    ConfigModule,
  ],
  providers: [
    EmailService,
    EmailTemplateService,
  ],
  exports: [
    EmailService,
    EmailTemplateService,
  ],
})
export class EmailModule {
  static forRoot(options: EmailModuleOptions): DynamicModule {
    return {
      module: EmailModule,
      providers: [
        {
          provide: 'EMAIL_MODULE_OPTIONS',
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => EmailModuleOptions | Promise<EmailModuleOptions>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: EmailModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'EMAIL_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
    };
  }

  static register(options: EmailModuleOptions): DynamicModule {
    return {
      module: EmailModule,
      providers: [
        {
          provide: 'EMAIL_MODULE_OPTIONS',
          useValue: options,
        },
      ],
    };
  }
}