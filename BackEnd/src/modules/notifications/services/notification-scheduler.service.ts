import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Not, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../dto/update-notification.dto';
import { NotificationChannel, NotificationPriority, NotificationType } from '../dto/create-notification.dto';
import { EmailService } from '../../../shared/services/email.service';
import { SmsService } from '../../../shared/services/sms.service';
import { PushNotificationService } from '../../../shared/services/push-notification.service';
import { WhatsappService } from '../../whatsapp/services/whatsapp.services';
import { SlackService } from '../../integrations/slack/services/slack.service';
import { Organization } from '@/modules/organizations/entities/organization.entity';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class NotificationSchedulerService {
    rescheduleNotification(notificationId: string, newScheduledFor: Date) {
        throw new Error('Method not implemented.');
    }
    scheduleNotification(notification: Notification, scheduledFor: Date) {
        throw new Error('Method not implemented.');
    }
    cancelScheduledNotification(notificationId: string) {
        throw new Error('Method not implemented.');
    }
    private readonly logger = new Logger(NotificationSchedulerService.name);
    private readonly MAX_RETRY_ATTEMPTS = 3;
    private readonly BATCH_SIZE = 100;

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly emailService: EmailService,
        private readonly smsService: SmsService,
        private readonly pushNotificationService: PushNotificationService,
        private readonly whatsappService: WhatsappService,
        private readonly slackService: SlackService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async processScheduledNotifications() {
        this.logger.debug('Processing scheduled notifications');

        try {
            const notifications = await this.notificationRepository.find({
                where: {
                    status: NotificationStatus.SCHEDULED,
                    scheduledFor: LessThanOrEqual(new Date()),
                },
                take: this.BATCH_SIZE,
            });

            for (const notification of notifications) {
                await this.processNotification(notification);
            }
        } catch (error) {
            this.logger.error('Error processing scheduled notifications', error);
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async retryFailedNotifications() {
        this.logger.debug('Retrying failed notifications');

        try {
            const notifications = await this.notificationRepository.find({
                where: {
                    status: NotificationStatus.FAILED,
                    retryCount: LessThanOrEqual(this.MAX_RETRY_ATTEMPTS),
                },
                take: this.BATCH_SIZE,
            });

            for (const notification of notifications) {
                await this.processNotification(notification, true);
            }
        } catch (error) {
            this.logger.error('Error retrying failed notifications', error);
        }
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanupExpiredNotifications() {
        this.logger.debug('Cleaning up expired notifications');

        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() - 30); // 30 days retention

            await this.notificationRepository.update(
                {
                    status: Not(In([NotificationStatus.DELIVERED, NotificationStatus.FAILED])),
                    createdAt: LessThanOrEqual(expiryDate),
                },
                {
                    status: NotificationStatus.EXPIRED as any,
                }
            );
        } catch (error) {
            this.logger.error('Error cleaning up expired notifications', error);
        }
    }

    private async processNotification(notification: Notification, isRetry: boolean = false) {
        this.logger.debug(`Processing notification ${notification.id}`);

        try {
            // Update status to processing
            notification.status = NotificationStatus.PROCESSING;
            await this.notificationRepository.save(notification);

            // Process each channel
            for (const channel of notification.channels) {
                await this.sendNotificationByChannel(notification, channel);
            }

            // Update notification status
            notification.status = NotificationStatus.DELIVERED;
            notification.deliveredAt = new Date();
            await this.notificationRepository.save(notification);

            // Emit event for successful delivery
            this.eventEmitter.emit('notification.delivered', notification);

        } catch (error) {
            this.logger.error(`Error processing notification ${notification.id}`, error);

            // Handle retry logic
            if (isRetry) {
                notification.retryCount = (notification.retryCount || 0) + 1;
            }

            // Update status based on retry attempts
            if (notification.retryCount >= this.MAX_RETRY_ATTEMPTS) {
                notification.status = NotificationStatus.FAILED;
                notification.error = error.message;
                this.eventEmitter.emit('notification.failed', notification);
            } else {
                notification.status = NotificationStatus.PENDING;
            }

            await this.notificationRepository.save(notification);
        }
    }

    private async sendNotificationByChannel(notification: Notification, channel: NotificationChannel) {
        switch (channel) {
            case NotificationChannel.EMAIL:
                await this.sendEmailNotification(notification);
                break;
            case NotificationChannel.SMS:
                await this.sendSmsNotification(notification);
                break;
            case NotificationChannel.PUSH:
                await this.sendPushNotification(notification);
                break;
            case NotificationChannel.WHATSAPP:
                await this.sendWhatsappNotification(notification, notification.recipientDetails);
                break;
            case NotificationChannel.SLACK:
                await this.sendSlackNotification(notification);
                break;
            case NotificationChannel.IN_APP:
                // In-app notifications don't need additional processing
                break;
            default:
                this.logger.warn(`Unknown notification channel: ${channel}`);
        }
    }

    private async sendEmailNotification(notification: Notification) {
        if (!notification.recipientDetails?.email) {
            throw new Error('Email address not provided');
        }

        this.emailService.send({
            to: notification.recipientDetails.email,
            subject: notification.title,
            template: 'notification',
            context: {
                title: notification.title,
                content: notification.content,
                data: notification.data,
            },
            id: '',
            organizationId: '',
            userId: '',
            senderId: '',
            type: NotificationType.SYSTEM,
            title: '',
            content: '',
            priority: NotificationPriority.LOW,
            status: NotificationStatus.SCHEDULED,
            requireConfirmation: false,
            channels: [],
            silent: false,
            read: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            organization: new Organization,
            user: new User,
            sender: new User,
            isRead: false,
            isExpired: false,
            isScheduled: false,
            isDelivered: false,
            requiresAction: false,
            failedChannels: []
        });
    }

    private async sendSmsNotification(notification: Notification) {
        if (!notification.recipientDetails?.phone) {
            throw new Error('Phone number not provided');
        }

        await this.smsService.send({
            to: notification.recipientDetails.phone,
            message: `${notification.title}: ${notification.content}`,
            id: '',
            organizationId: '',
            userId: '',
            senderId: '',
            type: NotificationType.SYSTEM,
            title: '',
            content: '',
            priority: NotificationPriority.LOW,
            status: NotificationStatus.SCHEDULED,
            requireConfirmation: false,
            channels: [],
            silent: false,
            read: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            organization: new Organization,
            user: new User,
            sender: new User,
            isRead: false,
            isExpired: false,
            isScheduled: false,
            isDelivered: false,
            requiresAction: false,
            failedChannels: []
        });
    }

    private async sendPushNotification(notification: Notification) {
        if (!notification.recipientDetails?.deviceTokens?.length) {
            throw new Error('No device tokens available');
        }

        await this.pushNotificationService.send({
            tokens: notification.recipientDetails.deviceTokens,
            title: notification.title,
            body: notification.content,
            data: notification.data,
            id: '',
            organizationId: '',
            userId: '',
            senderId: '',
            type: NotificationType.SYSTEM,
            content: '',
            priority: NotificationPriority.LOW,
            status: NotificationStatus.SCHEDULED,
            requireConfirmation: false,
            channels: [],
            silent: false,
            read: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            organization: new Organization,
            user: new User,
            sender: new User,
            isRead: false,
            isExpired: false,
            isScheduled: false,
            isDelivered: false,
            requiresAction: false,
            failedChannels: []
        });
    }

    private async sendWhatsappNotification(notification: any, user: any): Promise<boolean> {
        try {
          const whatsappService = this.whatsappService;
          
          // Fix the error by using the correct method name
          // Error was: Property 'send' does not exist on type 'WhatsappService'
          
          // Option 1: If the method should be 'sendMessage' instead of 'send'
          await whatsappService.sendMessage({
            to: user.phoneNumber,
            text: notification.content,
            // Add any other required parameters
          });
          
          // Option 2: If you need to add the 'send' method to WhatsappService
          // Implement this method in your WhatsappService class:
          /*
          // In src/shared/services/whatsapp.service.ts
          async send(params: { to: string, message: string, [key: string]: any }): Promise<any> {
            // Implementation details
            return this.sendMessage(params);
          }
          */
          
          return true;
        } catch (error) {
          this.logger.error(`Failed to send WhatsApp notification: ${error.message}`, error.stack);
          return false;
        }
      }

    private async sendSlackNotification(notification: Notification) {
        if (!notification.recipientDetails?.slackUserId) {
            throw new Error('Slack user ID not provided');
        }

        this.slackService.sendDirectMessage({
            userId: notification.recipientDetails.slackUserId,
            message: {
                text: notification.title,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: notification.content,
                        },
                    },
                ],
            },
        });
    }
}