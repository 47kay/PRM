// src/modules/emails/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../notifications/entities/email-template.entity';
import { EmailQueue } from '../notifications/entities/email-queue.entity';
import { EmailLog } from '../notifications/entities/email-log.entity';
import { EmailStatus } from '../notifications/enums/email-status.enum';

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

    constructor(
        @InjectRepository(EmailTemplate)
        private emailTemplateRepository: Repository<EmailTemplate>,
        @InjectRepository(EmailQueue)
        private emailQueueRepository: Repository<EmailQueue>,
        @InjectRepository(EmailLog)
        private emailLogRepository: Repository<EmailLog>,
    ) {}

    async sendAppointmentReminder(
        to: string,
        data: AppointmentReminderData,
    ): Promise<void> {
        try {
            const template = await this.emailTemplateRepository.findOne({
                where: { type: 'APPOINTMENT_REMINDER' },
            });

            if (!template) {
                throw new Error('Appointment reminder template not found');
            }

            const emailContent = this.compileTemplate(template.content, data);
            const subject = this.compileTemplate(template.subject, data);

            await this.emailQueueRepository.save({
                to,
                subject,
                content: emailContent,
                status: EmailStatus.PENDING,
                metadata: {
                    appointmentId: data.appointmentId,
                    type: 'APPOINTMENT_REMINDER',
                },
                priority: 'high',
            });

            await this.emailLogRepository.save({
                to,
                subject,
                type: 'APPOINTMENT_REMINDER',
                status: EmailStatus.QUEUED,
                metadata: {
                    appointmentId: data.appointmentId,
                },
            });
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