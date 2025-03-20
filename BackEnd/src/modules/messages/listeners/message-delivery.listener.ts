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
        
        // Add null check for deliveryDetails
        if (!message.deliveryDetails) {
            message.deliveryDetails = {
                provider: '', // Required field based on error
                errorCode: error.code,
                errorMessage: error.message,
                lastAttempt: new Date(),
                attempts: 1
            };
        } else {
            message.deliveryDetails = {
                ...message.deliveryDetails,
                errorCode: error.code,
                errorMessage: error.message,
                lastAttempt: new Date(),
                attempts: (message.deliveryDetails.attempts || 0) + 1,
            };
        }
        
        await this.messageRepository.save(message);
        
        // Null check for deliveryDetails before accessing attempts
        const attempts = message.deliveryDetails?.attempts || 0;
        
        // Notify admin about failure if attempts exceed threshold
        if (attempts >= 3) {
            await this.notificationsService.notifyMessageFailure(message);
        }
    }
}