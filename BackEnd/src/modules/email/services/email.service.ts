// src/modules/emails/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
// Comment out TypeORM imports that may be causing issues
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { EmailTemplate } from '../../notifications/entities/email-template.entity';
// import { Notification } from '../../notifications/entities/notification.entity';
// import { EmailQueue } from '../../notifications/entities/email-queue.entity';
// import { EmailLog } from '../../notifications/entities/email-log.entity';
// import { EmailStatus } from '../../notifications/enums/email-status.enum';

// Define EmailStatus enum locally if needed
enum EmailStatus {
    PENDING = 'PENDING',
    QUEUED = 'QUEUED',
    SENT = 'SENT',
    FAILED = 'FAILED'
}

// Define EmailOptions interface to fix the error
export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string; // Add this to fix the error in notifications.service.ts
}

interface AppointmentReminderData {
    appointmentId: string;
    patientName: string;
    doctorName: string;
    dateTime: Date;
    location: string;
    notes?: string;
    organizationName: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    // Remove repository injections temporarily
    constructor() {}
    // constructor(
    //     @InjectRepository(EmailTemplate)
    //     private emailTemplateRepository: Repository<EmailTemplate>,
    //     @InjectRepository(EmailQueue)
    //     private emailQueueRepository: Repository<EmailQueue>,
    //     @InjectRepository(EmailLog)
    //     private emailLogRepository: Repository<EmailLog>,
    // ) {}

    async sendNotificationEmail(to: string, data: { notifications: any[], userName: string }): Promise<void> {
        this.logger.log(`[MOCK] Sending notification email to ${to}`);
        // Implement your email provider integration here
    }

    async sendFollowUpEmail(email: string, details: any) {
        this.logger.log(`[MOCK] Sending follow-up email to ${email}`);
        // Implementation for sending follow-up email
    }

    async sendMail(to: string, subject: string, body: string): Promise<void> {
        this.logger.log(`[MOCK] Sending email to ${to} with subject: ${subject}`);

        // Implement your email sending logic here
        // This is a placeholder implementation

        this.logger.debug('Email content:', body);
    }

    async sendAppointmentReminder(
        to: string,
        data: AppointmentReminderData,
    ): Promise<void> {
        try {
            this.logger.log(`[MOCK] Sending appointment reminder to ${to} for appointment ${data.appointmentId}`);

            // Mock template compilation and sending
            const subject = `Appointment Reminder: ${data.patientName} with ${data.doctorName}`;
            const emailContent = this.compileTemplate(
                "Dear {{patientName}}, this is a reminder of your appointment with {{doctorName}} at {{organizationName}} on {{dateTime}}. Location: {{location}}{{notes}}",
                data
            );

            this.logger.debug(`Subject: ${subject}`);
            this.logger.debug(`Content: ${emailContent}`);

            // Mock repository operations
            this.logger.log('[MOCK] Email added to queue with status: PENDING');
            this.logger.log('[MOCK] Email log created with status: QUEUED');

        } catch (error) {
            this.logger.error(`Failed to send appointment reminder email to ${to}:`, error);
            throw error;
        }
    }

    private compileTemplate(template: string, data: Record<string, any>): string {
        return template.replace(
            /\{\{([^}]+)\}\}/g,
            (match, key) => data[key.trim()] || '',
        );
    }
}