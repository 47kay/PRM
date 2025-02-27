import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../dto/update-notification.dto';
import { NotificationChannel } from '../entities/notification.entity';
import { NotificationDeliveryService } from '../services/notification-delivery.service';

@Injectable()
export class NotificationDeliveryListener {
    private readonly logger = new Logger(NotificationDeliveryListener.name);

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly deliveryService: NotificationDeliveryService
    ) {}

    @OnEvent('notification.delivered')
    async handleNotificationDelivered(payload: { notification: Notification; channel: NotificationChannel }) {
        try {
            const { notification, channel } = payload;
            this.logger.debug(`Handling delivery success for notification ${notification.id} on channel ${channel}`);

            // Update delivery details for the specific channel
            notification.deliveryDetails = {
                ...notification.deliveryDetails,
                attempts: notification.deliveryDetails?.attempts || 0,
                lastAttempt: notification.deliveryDetails?.lastAttempt || new Date(),
                channels: [
                    ...(notification.deliveryDetails?.channels || []),
                    {
                        channel,
                        status: 'SUCCESS',
                        sentAt: new Date(),
                    }
                ]
            };

            // Check if all channels have delivered successfully
            const allChannelsDelivered = notification.channels.every(ch =>
                notification.deliveryDetails?.channels?.some(
                    d => d.channel === ch && d.status === 'SUCCESS'
                )
            );

            if (allChannelsDelivered) {
                notification.status = NotificationStatus.DELIVERED;
                notification.deliveredAt = new Date();
            }

            await this.notificationRepository.save(notification);

        } catch (error) {
            this.logger.error(
                `Error handling delivery success for notification ${payload.notification.id}:`,
                error
            );
            throw error;
        }
    }

    @OnEvent('notification.failed')
    async handleNotificationFailed(payload: { 
            notification: Notification; 
            channel: NotificationChannel; 
            error: any;
            retry?: boolean;
        }) {
        try {
            const { notification, channel, error, retry = true } = payload;
            this.logger.debug(`Handling delivery failure for notification ${notification.id} on channel ${channel}`);

            // Update delivery details
            notification.deliveryDetails = {
                ...notification.deliveryDetails,
                attempts: (notification.deliveryDetails?.attempts || 0) + 1,
                lastAttempt: new Date(),
                channels: [
                    ...(notification.deliveryDetails?.channels || []),
                    {
                        channel,
                        status: 'FAILED',
                        sentAt: new Date(),
                        error: error.message || 'Unknown error',
                    }
                ]
            };

            // Check if all channels have failed
            const allChannelsFailed = notification.channels.every(ch =>
                notification.deliveryDetails?.channels?.some(
                    d => d.channel === ch && d.status === 'FAILED'
                )
            );

            if (allChannelsFailed) {
                // Check if we should retry
                if (retry && notification.deliveryDetails.attempts < 3) {
                    notification.status = NotificationStatus.RETRY_PENDING;
                    await this.notificationRepository.save(notification);
                    
                    // Schedule retry with exponential backoff
                    const retryDelay = Math.pow(2, notification.deliveryDetails.attempts) * 1000;
                    setTimeout(() => {
                        this.deliveryService.retryNotification(notification);
                    }, retryDelay);
                } else {
                    notification.status = NotificationStatus.FAILED;
                    await this.notificationRepository.save(notification);
                }
            } else {
                await this.notificationRepository.save(notification);
            }

        } catch (error) {
            this.logger.error(
                `Error handling delivery failure for notification ${payload.notification.id}:`,
                error
            );
            throw error;
        }
    }

    @OnEvent('notification.delivery_timeout')
    async handleDeliveryTimeout(notification: Notification) {
        try {
            this.logger.debug(`Handling delivery timeout for notification ${notification.id}`);

            notification.status = NotificationStatus.FAILED;
            notification.deliveryDetails = {
                ...notification.deliveryDetails,
                attempts: notification.deliveryDetails?.attempts || 0,
                lastAttempt: notification.deliveryDetails?.lastAttempt || new Date(),
                channels: notification.deliveryDetails?.channels || [],
                error: 'Delivery timeout exceeded',
                timeoutAt: new Date()
            };

            await this.notificationRepository.save(notification);

        } catch (error) {
            this.logger.error(`Error handling delivery timeout for notification ${notification.id}:`, error);
            throw error;
        }
    }
}