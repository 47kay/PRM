import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationSchedulerService } from '../services/notification-scheduler.service';
import { NotificationStatus } from '../dto/update-notification.dto';

@Injectable()
export class NotificationScheduleListener {
    private readonly logger = new Logger(NotificationScheduleListener.name);

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly schedulerService: NotificationSchedulerService
    ) {}

    @OnEvent('notification.schedule')
    async handleNotificationSchedule(payload: { notification: Notification; scheduledFor: Date }) {
        try {
            const { notification, scheduledFor } = payload;
            this.logger.debug(`Scheduling notification ${notification.id} for ${scheduledFor}`);

            await this.schedulerService.scheduleNotification(notification, scheduledFor);
        } catch (error) {
            this.logger.error(`Error scheduling notification ${payload.notification.id}:`, error);
            throw error;
        }
    }

    @OnEvent('notification.reschedule')
    async handleNotificationReschedule(payload: { notificationId: string; newScheduledFor: Date }) {
        try {
            const { notificationId, newScheduledFor } = payload;
            this.logger.debug(`Rescheduling notification ${notificationId} for ${newScheduledFor}`);

            await this.schedulerService.rescheduleNotification(notificationId, newScheduledFor);
        } catch (error) {
            this.logger.error(`Error rescheduling notification ${payload.notificationId}:`, error);
            throw error;
        }
    }

    @OnEvent('notification.cancel_schedule')
    async handleNotificationCancelSchedule(notificationId: string) {
        try {
            this.logger.debug(`Canceling scheduled notification ${notificationId}`);
            await this.schedulerService.cancelScheduledNotification(notificationId);
        } catch (error) {
            this.logger.error(`Error canceling scheduled notification ${notificationId}:`, error);
            throw error;
        }
    }

    @OnEvent('notification.schedule_expired')
    async handleScheduleExpired(notification: Notification) {
        try {
            this.logger.debug(`Schedule expired for notification ${notification.id}`);
            
            notification.status = NotificationStatus.EXPIRED;
            notification.metadata = {
                ...notification.metadata,
                expirationReason: 'schedule_expired',
                expiredAt: new Date()
            };

            await this.notificationRepository.save(notification);
        } catch (error) {
            this.logger.error(`Error handling expired schedule for notification ${notification.id}:`, error);
            throw error;
        }
    }
}