// src/shared/shared.module.ts

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushNotificationService } from './services/push-notification.service';
import { WebhookService } from './services/webhook.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    EmailService,
    SmsService,
    PushNotificationService,
    WebhookService,
  ],
  exports: [
    EmailService,
    SmsService,
    PushNotificationService,
    WebhookService,
  ],
})
export class SharedModule {}