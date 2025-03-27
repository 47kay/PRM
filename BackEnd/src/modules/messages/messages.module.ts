// src/modules/messages/messages.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { MessagesController } from './controllers/messages.controller';
import { MessagesService } from './services/messages.service';
import { Message } from './entities/message.entity';
import { MessageTemplate } from './entities/message-template.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { TemplateCategory } from './entities/template-category.entity';
import { User } from '../users/entities/user.entity'; // Add User entity import
import { Contact } from '../contacts/entities/contact.entity'; // Add Contact entity import

import { UsersModule } from '../users/users.module';
import { ContactsModule } from '../contacts/contacts.module';
import { NotificationsModule } from '../notifications/notifications.module'; // Add NotificationsModule import

import { MessageEventHandler } from './events/message-event.handler';
import { MessageDeliveryListener } from './listeners/message-delivery.listener';
import { MessageQueueListener } from './listeners/message-queue.listener';

import { ErrorHandlerService } from './services/error-handler.service';
import { MessageDeliveryService } from './services/message-delivery.service';
import { MessageSchedulerService } from './services/message-scheduler.service';
import { TemplateService } from './services/template.service';
import { MessageRepository } from './repositories/message.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Message,
            MessageTemplate,
            MessageAttachment,
            TemplateCategory,
            User,       // Add User entity
            Contact     // Add Contact entity
        ]),
        EventEmitterModule.forRoot({
            wildcard: true,
            maxListeners: 20,
            verboseMemoryLeak: true,
        }),
        forwardRef(() => UsersModule),    // Import with forwardRef
        forwardRef(() => ContactsModule),  // Import with forwardRef if needed
        forwardRef(() => NotificationsModule)
        // forwardRef(() => OrganizationsModule),
        // forwardRef(() => AuthModule)
    ],
    controllers: [
        MessagesController
    ],
    providers: [
        MessagesService,
        ErrorHandlerService,
        MessageDeliveryService,
        MessageSchedulerService,
        TemplateService,
        MessageEventHandler,
        MessageDeliveryListener,
        MessageQueueListener,
        MessageRepository
    ],
    exports: [
        MessagesService,
        MessageDeliveryService,
        TemplateService
    ]
})
export class MessagesModule {}