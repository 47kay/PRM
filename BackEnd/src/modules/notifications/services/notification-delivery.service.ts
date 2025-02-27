import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../dto/update-notification.dto';
import { EmailService } from '../../../shared/services/email.service';
import { SmsService } from '../../../shared/services/sms.service';
import { PushNotificationService } from '../../../shared/services/push-notification.service';
import { WebhookService } from '../../../shared/services/webhook.service';

@Injectable()
export class NotificationDeliveryService {
    private readonly logger = new Logger(NotificationDeliveryService.name);
    private readonly MAX_RETRY_ATTEMPTS = 3;

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly emailService: EmailService,
        private readonly smsService: SmsService,
        private readonly pushNotificationService: PushNotificationService,
        private readonly webhookService: WebhookService,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async processNotification(notification: Notification) {
        try {
            notification.status = NotificationStatus.PROCESSING;
            await this.notificationRepository.save(notification);

            // Process each delivery channel in parallel
            const deliveryPromises = notification.channels.map(channel =>
                this.deliverToChannel(notification, channel)
            );

            await Promise.all(deliveryPromises);

        } catch (error) {
            this.logger.error(`Failed to process notification ${notification.id}:`, error);
            notification.status = NotificationStatus.FAILED;
            await this.notificationRepository.save(notification);
            
            this.eventEmitter.emit('notification.failed', {
                notification,
                error
            });
        }
    }

    async retryNotification(notification: Notification) {
        if ((notification.deliveryDetails?.attempts ?? 0) >= this.MAX_RETRY_ATTEMPTS) {
            throw new Error('Maximum retry attempts exceeded');
        }

        // Reset failed channels for retry
        notification.deliveryDetails = {
            ...notification.deliveryDetails,
            attempts: notification.deliveryDetails?.attempts ?? 0,
            lastAttempt: notification.deliveryDetails?.lastAttempt ?? new Date(),
            channels: notification.deliveryDetails?.channels.filter(c => c.status === 'SUCCESS') || []
        };

        return this.processNotification(notification);
    }

    private async deliverToChannel(notification: Notification, channel: string) {
        try {
            switch (channel.toLowerCase()) {
                case 'email':
                    await this.emailService.send(notification);
                    break;
                case 'sms':
                    await this.smsService.send(notification);
                    break;
                case 'push':
                    await this.pushNotificationService.send(notification);
                    break;
                case 'webhook':
                    await this.webhookService.send(notification);
                    break;
                default:
                    throw new Error(`Unsupported channel: ${channel}`);
            }

            this.eventEmitter.emit('notification.delivered', {
                notification,
                channel
            });

        } catch (error) {
            this.logger.error(
                `Failed to deliver notification ${notification.id} to channel ${channel}:`,
                error
            );

            this.eventEmitter.emit('notification.failed', {
                notification,
                channel,
                error
            });
        }
    }

    async getDeliveryStatus(notificationId: string) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId }
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        return {
            status: notification.status,
            deliveryDetails: notification.deliveryDetails,
            channels: notification.channels
        };
    }
}