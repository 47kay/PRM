// src/modules/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';

import { Notification as NotificationEntity } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationTemplate } from './entities/notification-template.entity';

import { NotificationListener } from './listeners/notification.listener';
import { NotificationScheduleListener } from './listeners/notification-schedule.listener';
import { NotificationDeliveryListener } from './listeners/notification-delivery.listener';

import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuthModule } from '../auth/auth.module';

import { EmailService } from '../../shared/services/email.service';
import { SmsService } from '../../shared/services/sms.service';
import { PushNotificationService } from '../../shared/services/push-notification.service';
import { WebhookService } from '../../shared/services/webhook.service';
import { WhatsappService } from '../whatsapp/services/whatsapp.services';
import { NotificationDeliveryService } from './services/notification-delivery.service';

export enum AppointmentEventTypes {
    CREATED = 'appointment.created',
    UPDATED = 'appointment.updated',
    CANCELLED = 'appointment.cancelled',
    COMPLETED = 'appointment.completed',
    RESCHEDULED = 'appointment.rescheduled',
  }

@Module({
    imports: [
        TypeOrmModule.forFeature([
            NotificationEntity,
            NotificationPreference,
            NotificationTemplate
        ]),
        EventEmitterModule.forRoot({
            // Enable wildcard event listeners
            wildcard: true,
            // Remove memory-leak warnings
            maxListeners: 20,
            // Enable verbose error handling
            verboseMemoryLeak: true,
        }),
        UsersModule,
        OrganizationsModule,
        AuthModule
    ],
    controllers: [NotificationsController],
    providers: [
        // Core services
        NotificationsService,
        NotificationSchedulerService,
        NotificationDeliveryService,

        // Event listeners
        NotificationListener,
        NotificationScheduleListener,
        NotificationDeliveryListener,

        // Delivery channel services
        EmailService,
        SmsService,
        PushNotificationService,
        WebhookService,
        WhatsappService,
    ],
    exports: [
        NotificationsService,
        NotificationDeliveryService
    ]
})
export class NotificationsModule {}