import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationChannel } from '../entities/notification.entity';
import { NotificationDeliveryService } from '../services/notification-delivery.service';
import { NotificationTemplate } from '../entities/notification-template.entity';

@Injectable()
export class NotificationListener {
    private readonly logger = new Logger(NotificationListener.name);

    constructor(
        @InjectRepository(NotificationTemplate)
        private readonly templateRepository: Repository<NotificationTemplate>,
        private readonly deliveryService: NotificationDeliveryService
    ) {}

    @OnEvent('notification.created')
    async handleNotificationCreated(notification: Notification) {
        try {
            this.logger.debug(`Processing new notification: ${notification.id}`);

            // If notification uses a template, process it
            if (notification.templateId) {
                await this.processTemplate(notification);
            }

            // Send to delivery service
            await this.deliveryService.processNotification(notification);

        } catch (error) {
            this.logger.error(`Error processing notification ${notification.id}:`, error);
            throw error;
        }
    }

    @OnEvent('notification.resend')
    async handleNotificationResend(notification: Notification) {
        try {
            this.logger.debug(`Resending notification: ${notification.id}`);
            await this.deliveryService.retryNotification(notification);
        } catch (error) {
            this.logger.error(`Error resending notification ${notification.id}:`, error);
            throw error;
        }
    }

    private async processTemplate(notification: Notification) {
        const template = await this.templateRepository.findOne({
            where: { id: notification.templateId }
        });

        if (!template) {
            throw new Error(`Template ${notification.templateId} not found`);
        }

        // Update template usage statistics
        await this.templateRepository.update(template.id, {
            lastUsedAt: new Date(),
            useCount: () => 'use_count + 1'
        });

        // Ensure metadata exists
        const metadata = notification.metadata || {};

        // Apply template to notification
        notification.subject = this.interpolateVariables(
            template.subject,
            metadata
        );
        notification.content = this.interpolateVariables(
            template.content,
            metadata
        );

        // Apply channel-specific content if available
        if (template.channelSpecificContent) {
            notification.channelContent = {
                ...notification.channelContent,
                ...this.processChannelContent(template.channelSpecificContent, metadata)
            };
        }

        // Inherit template channels if not specified
        if (!notification.channels?.length && template.channels?.length) {
            notification.channels = template.channels.map(channel => ({
                name: channel,
                type: 'default', // Replace with actual type
                isActive: true, // Replace with actual value

                // Add other required properties for NotificationChannel here
                // Example:
                additionalProperty: 'value' // Replace with actual properties
            } as unknown as NotificationChannel));
        }
    }

    private interpolateVariables(content: string, variables: Record<string, any>): string {
        return content.replace(/\{\{(.*?)\}\}/g, (match, variable) => {
            const key = variable.trim();
            return variables[key] !== undefined ? variables[key] : match;
        });
    }

    private processChannelContent(
        channelContent: NotificationTemplate['channelSpecificContent'],
        variables: Record<string, any>
    ) {
        const processed: Record<string, any> = {};

        for (const [channel, content] of Object.entries(channelContent)) {
            processed[channel] = {};
            
            for (const [key, value] of Object.entries(content)) {
                if (typeof value === 'string') {
                    processed[channel][key] = this.interpolateVariables(value, variables);
                } else {
                    processed[channel][key] = value;
                }
            }
        }

        return processed;
    }
}