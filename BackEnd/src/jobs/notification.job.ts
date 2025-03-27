// src/jobs/notification.job.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { User } from '../modules/users/entities/user.entity';
import { PushSubscription } from '../modules/notifications/entities/push-subscription.entity';
import { EmailService } from '../modules/email/services/email.service';
import { SmsService } from '../modules/sms/services/sms.service';
import { NotificationPriority } from '../modules/notifications/enums/notification-priority.enum';



export interface NotificationJob {
    type: 'SYSTEM' | 'USER' | 'ORGANIZATION';
    title: string;
    message: string;
    data?: Record<string, any>;
    priority?: NotificationPriority;

    recipients: {
        userIds?: string[];
        organizationIds?: string[];
        roles?: string[];
    };
    channels?: {
        inApp?: boolean;
        email?: boolean;
        sms?: boolean;
        push?: boolean;
    };
    metadata?: {
        source?: string;
        category?: string;
        tags?: string[];
        expiresAt?: Date;
    };
}

@Injectable()
@Processor('notifications')
@WebSocketGateway()
export class NotificationJob {
    private readonly logger = new Logger(NotificationJob.name);

    @WebSocketServer()
    server: Server;

    constructor(
        @InjectQueue('notifications') private readonly notificationQueue: Queue<NotificationJob>,
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PushSubscription)
        private readonly pushSubscriptionRepository: Repository<PushSubscription>,
        private readonly emailService: EmailService,
        private readonly smsService: SmsService,
        private readonly configService: ConfigService,
    ) {}

    @Process('send')
    async processNotification(job: Job<NotificationJob>) {
        const { data } = job;
        this.logger.debug(`Processing notification job ${job.id}`);

        try {
            // Get recipients
            const recipients = await this.getRecipients(data.recipients);
            
            if (!recipients.length) {
                this.logger.warn(`No recipients found for notification ${job.id}`);
                return { success: false, error: 'No recipients found' };
            }

            // Create notification records
            const notifications = await this.createNotifications(data, recipients);

            // Process each delivery channel
            await Promise.all([
                // In-app notifications
                data.channels?.inApp !== false && this.sendInAppNotifications(notifications),
                // Email notifications
                data.channels?.email && this.sendEmailNotifications(notifications),
                // SMS notifications
                data.channels?.sms && this.sendSmsNotifications(notifications),
                // Push notifications
                data.channels?.push && this.sendPushNotifications(notifications),
            ]);

            return { success: true, notificationIds: notifications.map(n => n.id) };
        } catch (error) {
            this.logger.error(`Failed to process notification job ${job.id}:`, error);
            throw error;
        }
    }

    private async getRecipients(recipientData: NotificationJob['recipients']): Promise<User[]> {
        const query = this.userRepository.createQueryBuilder('user');

        if (recipientData.userIds?.length) {
            query.orWhere('user.id IN (:...userIds)', { userIds: recipientData.userIds });
        }

        if (recipientData.organizationIds?.length) {
            query.orWhere('user.organizationId IN (:...orgIds)', { 
                orgIds: recipientData.organizationIds 
            });
        }

        if (recipientData.roles?.length) {
            query.orWhere('user.role IN (:...roles)', { roles: recipientData.roles });
        }

        return query.getMany();
    }

    private async createNotifications(
        data: NotificationJob,
        recipients: User[],
    ): Promise<Notification[]> {
        const notifications = recipients.map(recipient => {
            const notification = new Notification();
            notification.type = data.type;
            notification.title = data.title;
            notification.message = data.message;
            notification.data = data.data;
            notification.priority = data.priority || NotificationPriority.MEDIUM;

            notification.userId = recipient.id;
            notification.organizationId = recipient.organizationId;
            notification.metadata = {
                ...data.metadata,
                recipientRole: recipient.role,
            };
            notification.status = 'PENDING';
            notification.expiresAt = data.metadata?.expiresAt;
            return notification;
        });

        return this.notificationRepository.save(notifications);
    }

    private async sendInAppNotifications(notifications: Notification[]) {
        try {
            // Group notifications by user
            const userNotifications = notifications.reduce((acc, notification) => {
                if (!acc[notification.userId]) {
                    acc[notification.userId] = [];
                }
                acc[notification.userId].push(notification);
                return acc;
            }, {} as Record<string, Notification[]>);

            // Send to connected users via WebSocket
            Object.entries(userNotifications).forEach(([userId, userNotifs]) => {
                this.server.to(`user:${userId}`).emit('notifications', userNotifs);
            });

            // Mark as delivered
            await this.notificationRepository.update(
                { id: In(notifications.map(n => n.id)) },
                { 
                    status: 'DELIVERED' as any,
                    deliveredAt: new Date() as any,
                },
            );
        } catch (error) {
            this.logger.error('Failed to send in-app notifications:', error);
            throw error;
        }
    }

    private async sendEmailNotifications(notifications: Notification[]) {
        try {
            // Group by user to avoid duplicate emails
            const userNotifications = notifications.reduce((acc, notification) => {
                if (!acc[notification.userId]) {
                    acc[notification.userId] = [];
                }
                acc[notification.userId].push(notification);
                return acc;
            }, {} as Record<string, Notification[]>);

            // Send emails
            const emailPromises = Object.entries(userNotifications).map(async ([userId, userNotifs]) => {
                const user = await this.userRepository.findOne({ where: { id: userId } });
                if (!user?.email) return;

                await this.emailService.sendNotificationEmail(user.email, {
                    notifications: userNotifs,
                    userName: `${user.firstName} ${user.lastName}`,
                });
            });

            await Promise.all(emailPromises);
        } catch (error) {
            this.logger.error('Failed to send email notifications:', error);
            throw error;
        }
    }

    private async sendSmsNotifications(notifications: Notification[]) {
        try {
            // Group by user to avoid duplicate SMS
            const userNotifications = notifications.reduce((acc, notification) => {
                if (!acc[notification.userId]) {
                    acc[notification.userId] = [];
                }
                acc[notification.userId].push(notification);
                return acc;
            }, {} as Record<string, Notification[]>);

            // Send SMS
            const smsPromises = Object.entries(userNotifications).map(async ([userId, userNotifs]) => {
                const user = await this.userRepository.findOne({ where: { id: userId } });
                if (!user || !user.mobilePhone) return;

                // Change this line:
                // await this.smsService.sendSms(user.mobilePhone, {
                //     notifications: userNotifs,
                //     userName: `${user.firstName} ${user.lastName}`,
                // });

                // To this (which matches your SmsService.sendSms method signature):
                const message = `You have ${userNotifs.length} new notification(s): ${userNotifs[0].title}${userNotifs.length > 1 ? ' and more...' : ''}`;
                await this.smsService.sendSms(user.mobilePhone, message);
            });

            await Promise.all(smsPromises);
        } catch (error) {
            this.logger.error('Failed to send SMS notifications:', error);
            throw error;
        }
    }

    private async sendPushNotifications(notifications: Notification[]) {
        try {
            // Get push subscriptions for users
            const subscriptions = await this.pushSubscriptionRepository.find({
                where: {
                    userId: In(notifications.map(n => n.userId)),
                    active: true,
                },
            });

            // Group notifications by user
            const userNotifications = notifications.reduce((acc, notification) => {
                if (!acc[notification.userId]) {
                    acc[notification.userId] = [];
                }
                acc[notification.userId].push(notification);
                return acc;
            }, {} as Record<string, Notification[]>);

            // Send push notifications
            const pushPromises = subscriptions.map(async subscription => {
                const userNotifs = userNotifications[subscription.userId];
                if (!userNotifs) return;

                await this.sendPushNotification(subscription, userNotifs);
            });

            await Promise.all(pushPromises);
        } catch (error) {
            this.logger.error('Failed to send push notifications:', error);
            throw error;
        }
    }

    private async sendPushNotification(
        subscription: PushSubscription,
        notifications: Notification[],
    ) {
        try {
            const webpush = require('web-push');
            
            webpush.setVapidDetails(
                'mailto:' + this.configService.get('mail.from'),
                this.configService.get('push.publicKey'),
                this.configService.get('push.privateKey'),
            );

            await webpush.sendNotification(
                JSON.parse(subscription.subscription),
                JSON.stringify({
                    notifications,
                    timestamp: new Date().toISOString(),
                }),
            );
        } catch (error) {
            this.logger.error('Failed to send push notification:', error);
            
            if (error.statusCode === 410) {
                // Subscription has expired or is no longer valid
                await this.pushSubscriptionRepository.update(
                    { id: subscription.id },
                    { active: false },
                );
            }
            
            throw error;
        }
    }

    // Queue management methods
    async addToQueue(data: NotificationJob): Promise<Job<NotificationJob>> {
        return this.notificationQueue.add('send', data, {
            priority: this.getPriorityLevel(data.priority),
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });
    }

    private getPriorityLevel(priority?: NotificationJob['priority']): number {
        switch (priority) {
            case NotificationPriority.URGENT:
                return 1;
            case NotificationPriority.HIGH:
                return 2;
            case NotificationPriority.MEDIUM:
                return 3;
            case NotificationPriority.LOW:
                return 4;
            default:
                return 3;
        }
    }

    // Cleanup methods
    async cleanupOldNotifications() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await this.notificationRepository.delete({
            createdAt: LessThan(thirtyDaysAgo),
            status: In(['DELIVERED', 'READ']),
        });
    }
}