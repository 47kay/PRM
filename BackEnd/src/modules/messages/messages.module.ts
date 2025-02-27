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

// src/modules/messages/listeners/message-queue.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Message } from '../entities/message.entity';
import { MessageDeliveryService } from '../services/message-delivery.service';

@Injectable()
export class MessageQueueListener {
    constructor(private readonly deliveryService: MessageDeliveryService) {}

    @OnEvent('message.created')
    handleMessageCreated(message: Message) {
        return this.deliveryService.processMessage(message);
    }

    @OnEvent('message.resend')
    handleMessageResend(message: Message) {
        return this.deliveryService.processMessage(message);
    }

    @OnEvent('messages.bulk.created')
    handleBulkMessages(messages: Message[]) {
        return this.deliveryService.processBulkMessages(messages);
    }
}

// src/modules/messages/listeners/message-delivery.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MessageStatus } from '../dto/create-message.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class MessageDeliveryListener {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        private readonly notificationsService: NotificationsService,
    ) {}

    @OnEvent('message.delivered')
    async handleMessageDelivered(payload: { message: Message; deliveryDetails: any }) {
        const { message, deliveryDetails } = payload;
        
        message.status = MessageStatus.DELIVERED;
        message.deliveredAt = new Date();
        message.deliveryDetails = deliveryDetails;
        
        await this.messageRepository.save(message);
        
        // Notify relevant users about delivery
        await this.notificationsService.notifyMessageDelivery(message);
    }

    @OnEvent('message.failed')
    async handleMessageFailed(payload: { message: Message; error: any }) {
        const { message, error } = payload;
        
        message.status = MessageStatus.FAILED;
        message.deliveryDetails = {
            ...message.deliveryDetails,
            errorCode: error.code,
            errorMessage: error.message,
            lastAttempt: new Date(),
            attempts: (message.deliveryDetails?.attempts || 0) + 1,
        };
        
        await this.messageRepository.save(message);
        
        // Notify admin about failure if attempts exceed threshold
        if (message.deliveryDetails.attempts >= 3) {
            await this.notificationsService.notifyMessageFailure(message);
        }
    }
}