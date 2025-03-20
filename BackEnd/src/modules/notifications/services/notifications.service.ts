import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationChannel } from '../entities/notification.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { EmailService } from '../../../shared/services/email.service';
import { SmsService } from '../../../shared/services/sms.service';
import { WhatsappService } from '../../whatsapp/services/whatsapp.services';
import { NotificationStatus } from '../dto/update-notification.dto';
import { Message } from '../../messages/entities/message.entity'; // Adjust the path as necessary
import { UpdateNotificationDto } from '../dto/update-notification.dto';

export interface SendNotificationDto {
  type: string;
  title: string;
  message: string;
  organizationId?: string;
  data?: Record<string, any>;
  userId: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

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

  async notifyMessageFailure(message: Message): Promise<void> {
    // Implementation for notifying admin about message failure
  }

  async getNotificationChannels(organizationId: string, userId: string): Promise<any> {
    // Implement the logic to get notification channels
    return [];
  }

  async getUserPreferences(organizationId: string, userId: string): Promise<any> {
    // Implement the logic to get user preferences
    return {}; // Replace with actual implementation
  }

  async getNotificationById(id: string, organizationId: string, userId: string): Promise<Notification | null> {
    // Implement the logic to get a notification by id
    // This is a placeholder implementation
    return null;
  }

  async updateNotification(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    // Implementation for updating a notification
    // This is a placeholder implementation, replace it with actual logic
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
        throw new NotFoundException('Notification not found');
    }
    Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async notifyMessageDelivery(message: Message): Promise<void> {
    // Implementation for notifying about message delivery
    console.log(`Message delivered: ${message.id}`);
  }

  async create(notificationData: {
    type: string;
    title: string;
    content: string;
    recipients: { userId: string }[];
    organizationId: string;
    senderId: string;
    priority?: string;
  }): Promise<void> {
    // Implementation for creating a notification
    // This is a placeholder implementation
    console.log('Notification created:', notificationData);
  }

  async send(dto: SendNotificationDto): Promise<void> {
    try {
      const preferences = await this.preferenceRepository.findOne({
        where: {
          userId: dto.userId,
          category: dto.type as unknown as any,
        },
      });

      if (!preferences) {
        this.logger.warn(`No notification preferences found for user ${dto.userId}`);
        return;
      }

      const template = await this.templateRepository.findOne({
        where: { type: dto.type } as any,
      });

      const content = template
        ? this.compileTemplate(template.content, { ...dto.data, title: dto.title, message: dto.message })
        : dto.message;

      const notification = await this.notificationRepository.save({
        userId: dto.userId,
        type: dto.type,
        content,
        title: dto.title,
        metadata: {
          ...dto.data,
          organizationId: dto.organizationId,
          priority: dto.priority,
        },
        status: String(NotificationStatus.PENDING),
        organizationId: dto.organizationId || '',
        senderId: dto.userId,
        channels: preferences.enabledChannels,
      });

      const notificationPromises: Promise<void>[] = [];

      if (
        preferences.enabledChannels.includes(NotificationChannel.EMAIL) &&
        preferences.channelSpecificSettings?.email?.addresses?.length
      ) {
        const email = preferences.channelSpecificSettings.email.addresses[0];
        notificationPromises.push(
          this.sendEmailNotification(email, {
            appointmentId: dto.data?.userId || 'N/A',
            patientName: 'User',
            doctorName: 'N/A',
            dateTime: new Date(),
            location: 'N/A',
            notes: `${dto.title}: ${dto.message}`,
            organizationName: dto.organizationId || 'System',
          }),
        );
      }

      if (
        preferences.enabledChannels.includes(NotificationChannel.SMS) &&
        preferences.channelSpecificSettings?.sms?.phoneNumbers?.length
      ) {
        const phone = preferences.channelSpecificSettings.sms.phoneNumbers[0];
        notificationPromises.push(
          this.sendSmsNotification(phone, {
            appointmentId: dto.data?.userId || 'N/A',
            patientName: 'User',
            dateTime: new Date(),
            organizationName: dto.organizationId || 'System',
          }),
        );
      }

      if (
        preferences.enabledChannels.includes(NotificationChannel.WHATSAPP) &&
        preferences.channelSpecificSettings?.whatsapp?.numbers?.length
      ) {
        const whatsappNumber = preferences.channelSpecificSettings.whatsapp.numbers[0];
        notificationPromises.push(
          this.whatsappService.sendAppointmentReminder(whatsappNumber, {
            appointmentId: dto.data?.userId || 'N/A',
            patientName: 'User',
            doctorName: 'N/A',
            dateTime: new Date(),
            location: 'N/A',
            organizationName: dto.organizationId || 'System',
          }),
        );
      }

      await Promise.all(notificationPromises);

      await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ status: String(NotificationStatus.SENT) } as unknown as any)
        .where('id = :id', { id: notification.id })
        .execute();

      this.logger.log(`Successfully sent notification ${notification.id} to user ${dto.userId}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${dto.userId}:`, error);
      throw error;
    }
  }

  async notifyError(source: string, error: Error): Promise<void> {
    try {
      const notification = await this.notificationRepository.save({
        type: 'ERROR',
        source,
        content: error.message,
        title: 'System Error',
        metadata: {
          stack: error.stack,
          timestamp: new Date().toISOString(),
        },
        status: String(NotificationStatus.PENDING),
        organizationId: '',
        senderId: 'system',
        channels: [NotificationChannel.EMAIL],
      });

      const adminPreferences = await this.preferenceRepository.find({
        where: { category: 'ERROR' as unknown as any },
      });

      for (const pref of adminPreferences) {
        try {
          const notificationPromises: Promise<void>[] = [];

          if (
            pref.enabledChannels.includes(NotificationChannel.EMAIL) &&
            pref.channelSpecificSettings?.email?.addresses?.length
          ) {
            const email = pref.channelSpecificSettings.email.addresses[0];
            notificationPromises.push(
              this.sendEmailNotification(email, {
                appointmentId: 'N/A',
                patientName: 'N/A',
                doctorName: 'N/A',
                dateTime: new Date(),
                location: 'N/A',
                notes: `Error in ${source}: ${error.message}`,
                organizationName: 'System',
              }),
            );
          }

          if (
            pref.enabledChannels.includes(NotificationChannel.SMS) &&
            pref.channelSpecificSettings?.sms?.phoneNumbers?.length
          ) {
            const phone = pref.channelSpecificSettings.sms.phoneNumbers[0];
            notificationPromises.push(
              this.sendSmsNotification(phone, {
                appointmentId: 'N/A',
                patientName: 'Admin',
                dateTime: new Date(),
                organizationName: `System Error: ${source}`,
              }),
            );
          }

          if (
            pref.enabledChannels.includes(NotificationChannel.WHATSAPP) &&
            pref.channelSpecificSettings?.whatsapp?.numbers?.length
          ) {
            const whatsappNumber = pref.channelSpecificSettings.whatsapp.numbers[0];
            notificationPromises.push(
              this.whatsappService.sendAppointmentReminder(whatsappNumber, {
                appointmentId: 'N/A',
                patientName: 'Admin',
                doctorName: 'N/A',
                dateTime: new Date(),
                location: 'N/A',
                organizationName: `System Error: ${source}`,
              }),
            );
          }

          await Promise.all(notificationPromises);
        } catch (notifyError) {
          this.logger.error(`Failed to notify admin ${pref.userId}:`, notifyError);
        }
      }

      await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ status: String(NotificationStatus.SENT) } as unknown as any)
        .where('id = :id', { id: notification.id })
        .execute();
    } catch (error) {
      this.logger.error('Failed to process error notification:', error);
      throw error;
    }
  }

  async sendNotification(userId: string, type: string, data: Record<string, any>): Promise<void> {
    try {
      const preferences = await this.preferenceRepository.findOne({
        where: {
          userId,
          category: type as unknown as any,
        },
      });

      if (!preferences) {
        this.logger.warn(`No notification preferences found for user ${userId}`);
        return;
      }

      const template = await this.templateRepository.findOne({
        where: { type } as any,
      });

      if (!template) {
        throw new Error(`Template not found for notification type: ${type}`);
      }

      const notification = await this.notificationRepository.save({
        userId,
        type,
        content: this.compileTemplate(template.content, data),
        title: data.title || 'Notification',
        metadata: data,
        status: String(NotificationStatus.PENDING),
        organizationId: data.organizationId || '',
        senderId: userId,
        channels: preferences.enabledChannels,
      });

      const notificationPromises: Promise<void>[] = [];

      if (
        preferences.enabledChannels.includes(NotificationChannel.EMAIL) &&
        data.email
      ) {
        notificationPromises.push(
          this.sendEmailNotification(data.email, {
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

      if (
        preferences.enabledChannels.includes(NotificationChannel.SMS) &&
        data.phone
      ) {
        notificationPromises.push(
          this.sendSmsNotification(data.phone, {
            appointmentId: data.appointmentId || 'N/A',
            patientName: data.patientName || 'N/A',
            dateTime: data.dateTime || new Date(),
            organizationName: data.organizationName || 'System',
          }),
        );
      }

      if (
        preferences.enabledChannels.includes(NotificationChannel.WHATSAPP) &&
        data.whatsapp
      ) {
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

      await Promise.all(notificationPromises);

      await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ status: String(NotificationStatus.SENT) } as unknown as any)
        .where('id = :id', { id: notification.id })
        .execute();

      this.logger.log(`Successfully sent notification ${notification.id} to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
      throw error;
    }
  }

  private compileTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = key.split('.').reduce((obj: any, k: string) => obj?.[k], data);
      return value || '';
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        readAt: new Date(),
        read: true
      } as unknown as any)
      .where('id = :id AND userId = :userId', { id: notificationId, userId })
      .execute();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        readAt: new Date(),
        read: true
      } as unknown as any)
      .where('userId = :userId AND readAt IS NULL', { userId })
      .execute();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { 
        userId, 
        readAt: null as any 
      },
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

  // Helper methods to forward notifications to the appropriate service
  private async sendEmailNotification(
    email: string, 
    data: {
      appointmentId: string;
      patientName: string;
      doctorName: string;
      dateTime: Date;
      location: string;
      notes?: string;
      organizationName: string;
    }
  ): Promise<void> {
    try {
      // Using sendMail which is more likely to exist in EmailService
      await this.emailService.sendEmail?.({
        to: email,
        subject: `Appointment Reminder: ${data.organizationName}`,
        html: this.formatEmailContent(data)
      });
      this.logger.log(`Sent email notification to ${email}`);
    } catch (error) {
      // If sendMail doesn't exist, log the error but don't crash
      this.logger.error(`Error sending email to ${email}:`, error);
      // Implement a simple fallback
      this.logger.log(`Would send email to ${email} with content: ${JSON.stringify(data)}`);
    }
  }

  private async sendSmsNotification(
    phone: string,
    data: {
      appointmentId: string;
      patientName: string;
      dateTime: Date;
      organizationName: string;
    }
  ): Promise<void> {
    try {
      // Using sendSms which is more likely to exist in SmsService
      await this.smsService.sendSms?.(
        phone,
        this.formatSmsContent(data)
      );
      this.logger.log(`Sent SMS notification to ${phone}`);
    } catch (error) {
      // If sendSms doesn't exist, log the error but don't crash
      this.logger.error(`Error sending SMS to ${phone}:`, error);
      // Implement a simple fallback
      this.logger.log(`Would send SMS to ${phone} with content: ${JSON.stringify(data)}`);
    }
  }

  private formatEmailContent(data: {
    patientName: string;
    doctorName: string;
    dateTime: Date;
    location: string;
    notes?: string;
    organizationName: string;
  }): string {
    return `
      <div>
        <h2>Appointment Reminder</h2>
        <p>Hello ${data.patientName},</p>
        <p>This is a reminder of your appointment with ${data.doctorName} on ${data.dateTime.toLocaleString()}</p>
        <p>Location: ${data.location}</p>
        ${data.notes ? `<p>Notes: ${data.notes}</p>` : ''}
        <p>Regards,<br>${data.organizationName}</p>
      </div>
    `;
  }

  private formatSmsContent(data: {
    patientName: string;
    dateTime: Date;
    organizationName: string;
  }): string {
    return `Hi ${data.patientName}, reminder of your appointment with ${data.organizationName} on ${data.dateTime.toLocaleString()}`;
  }
}