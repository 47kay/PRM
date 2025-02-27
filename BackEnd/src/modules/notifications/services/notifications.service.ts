// src/modules/notifications/services/notifications.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { EmailService } from '../../email/email.service';
import { SmsService } from '../../sms/sms.service';
import { WhatsappService } from '../../whatsapp/services/whatsapp.services';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(NotificationTemplate)
        private templateRepository: Repository<NotificationTemplate>,
        @InjectRepository(NotificationPreference)
        private preferenceRepository: Repository<NotificationPreference>,
        private emailService: EmailService,
        private smsService: SmsService,
        private whatsappService: WhatsappService,
    ) {}

    async notifyError(source: string, error: Error): Promise<void> {
        try {
            // Create notification record
            const notification = await this.notificationRepository.save({
                type: 'ERROR',
                source,
                content: error.message,
                metadata: {
                    stack: error.stack,
                    timestamp: new Date().toISOString(),
                },
                status: 'PENDING',
            });

            // Get admin notification preferences
            const adminPreferences = await this.preferenceRepository.find({
                where: { role: 'ADMIN', notificationType: 'ERROR' },
            });

            // Notify admins based on their preferences
            for (const pref of adminPreferences) {
                try {
                    const notificationPromises: Promise<void>[] = [];

                    if (pref.email && pref.emailEnabled) {
                        notificationPromises.push(
                            this.emailService.sendAppointmentReminder(
                                pref.email,
                                {
                                    appointmentId: 'N/A',
                                    patientName: 'N/A',
                                    doctorName: 'N/A',
                                    dateTime: new Date(),
                                    location: 'N/A',
                                    notes: `Error in ${source}: ${error.message}`,
                                    organizationName: 'System',
                                },
                            ),
                        );
                    }

                    if (pref.phone && pref.smsEnabled) {
                        notificationPromises.push(
                            this.smsService.sendAppointmentReminder(
                                pref.phone,
                                {
                                    appointmentId: 'N/A',
                                    patientName: 'Admin',
                                    dateTime: new Date(),
                                    organizationName: `System Error: ${source}`,
                                },
                            ),
                        );
                    }

                    if (pref.whatsapp && pref.whatsappEnabled) {
                        notificationPromises.push(
                            this.whatsappService.sendAppointmentReminder(
                                pref.whatsapp,
                                {
                                    appointmentId: 'N/A',
                                    patientName: 'Admin',
                                    doctorName: 'N/A',
                                    dateTime: new Date(),
                                    location: 'N/A',
                                    organizationName: `System Error: ${source}`,
                                },
                            ),
                        );
                    }

                    await Promise.all(notificationPromises);
                } catch (notifyError) {
                    this.logger.error(`Failed to notify admin ${pref.userId}:`, notifyError);
                }
            }

            // Update notification status
            await this.notificationRepository.update(
                notification.id,
                { status: 'SENT' },
            );
        } catch (error) {
            this.logger.error('Failed to process error notification:', error);
            throw error;
        }
    }

    async sendNotification(
        userId: string,
        type: string,
        data: Record<string, any>,
    ): Promise<void> {
        try {
            // Get user notification preferences
            const preferences = await this.preferenceRepository.findOne({
                where: { userId, notificationType: type },
            });

            if (!preferences) {
                this.logger.warn(`No notification preferences found for user ${userId}`);
                return;
            }

            // Get notification template
            const template = await this.templateRepository.findOne({
                where: { type },
            });

            if (!template) {
                throw new Error(`Template not found for notification type: ${type}`);
            }

            // Create notification record
            const notification = await this.notificationRepository.save({
                userId,
                type,
                content: this.compileTemplate(template.content, data),
                metadata: data,
                status: 'PENDING',
            });

            // Send notifications based on user preferences
            const notificationPromises: Promise<void>[] = [];

            if (preferences.emailEnabled && data.email) {
                notificationPromises.push(
                    this.emailService.sendAppointmentReminder(data.email, {
                        appointmentId: data.appointmentId || 'N/A',
                        patientName: data.patientName || 'N/A',
                        doctorName: data.doctorName || 'N/A',
                        dateTime: data.dateTime || new Date(),
                        location: data.location || 'N/A',
                        notes: data.notes,
                        organizationName: data.organizationName || 'System',
                    }),
                );
            }

            if (preferences.smsEnabled && data.phone) {
                notificationPromises.push(
                    this.smsService.sendAppointmentReminder(data.phone, {
                        appointmentId: data.appointmentId || 'N/A',
                        patientName: data.patientName || 'N/A',
                        dateTime: data.dateTime || new Date(),
                        organizationName: data.organizationName || 'System',
                    }),
                );
            }

            if (preferences.whatsappEnabled && data.whatsapp) {
                notificationPromises.push(
                    this.whatsappService.sendAppointmentReminder(data.whatsapp, {
                        appointmentId: data.appointmentId || 'N/A',
                        patientName: data.patientName || 'N/A',
                        doctorName: data.doctorName || 'N/A',
                        dateTime: data.dateTime || new Date(),
                        location: data.location || 'N/A',
                        organizationName: data.organizationName || 'System',
                    }),
                );
            }

            // Wait for all notifications to be sent
            await Promise.all(notificationPromises);

            // Update notification status
            await this.notificationRepository.update(
                notification.id,
                { status: 'SENT' },
            );

            this.logger.log(`Successfully sent notification ${notification.id} to user ${userId}`);
        } catch (error) {
            this.logger.error(`Failed to send notification to user ${userId}:`, error);
            throw error;
        }
    }

    private compileTemplate(template: string, data: Record<string, any>): string {
        return template.replace(
            /\{\{([^}]+)\}\}/g,
            (match, key) => {
                const value = key.split('.').reduce((obj, k) => obj?.[k], data);
                return value || '';
            },
        );
    }

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await this.notificationRepository.update(
            { id: notificationId, userId },
            { readAt: new Date() },
        );
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { userId, readAt: null },
            { readAt: new Date() },
        );
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationRepository.count({
            where: { userId, readAt: null },
        });
    }

    async getUserNotifications(
        userId: string,
        options: {
            skip?: number;
            take?: number;
            includeRead?: boolean;
        } = {},
    ): Promise<{ notifications: Notification[]; total: number }> {
        const { skip = 0, take = 10, includeRead = false } = options;

        const queryBuilder = this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.userId = :userId', { userId });

        if (!includeRead) {
            queryBuilder.andWhere('notification.readAt IS NULL');
        }

        const [notifications, total] = await queryBuilder
            .orderBy('notification.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getManyAndCount();

        return { notifications, total };
    }
}