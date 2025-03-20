// src/modules/messages/messages.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { MessagesController } from './controllers/messages.controller';
import { MessagesService } from './services/messages.service';
import { Message } from './entities/message.entity';
import { MessageTemplate } from './entities/message-template.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { Contact } from '../contacts/entities/contact.entity';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { MessageQueueListener } from './listeners/message-queue.listener';
import { MessageDeliveryListener } from './listeners/message-delivery.listener';
import { MessageSchedulerService } from './services/message-scheduler.service';
import { MessageDeliveryService } from './services/message-delivery.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Message,
            MessageTemplate,
            MessageAttachment,
            Contact
        ]),
        EventEmitterModule.forRoot({
            // Enable wildcard event listeners
            wildcard: true,
            // Remove memory-leak warnings
            maxListeners: 20,
            // Enable verbose error handling
            verboseMemoryLeak: true,
        }),
        AuthModule,
        UsersModule,
        OrganizationsModule,
        NotificationsModule
    ],
    controllers: [MessagesController],
    providers: [
        MessagesService,
        MessageQueueListener,
        MessageDeliveryListener,
        MessageSchedulerService,
        MessageDeliveryService
    ],
    exports: [MessagesService, MessageDeliveryService]
})
export class MessagesModule {}