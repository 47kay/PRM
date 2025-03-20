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