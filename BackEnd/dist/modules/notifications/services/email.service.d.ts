import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailTemplate } from '../entities/email-template.entity';
import { EmailQueue } from '../entities/email-queue.entity';
import { EmailLog } from '../entities/email-log.entity';
import { EmailStatus } from '../enums/email-status.enum';
interface SendEmailOptions {
    to: string | string[];
    subject: string;
    template?: string;
    variables?: Record<string, any>;
    htmlContent?: string;
    textContent?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
    metadata?: Record<string, any>;
    organizationId: string;
    scheduledFor?: Date;
}
export declare class EmailService {
    private readonly templateRepository;
    private readonly queueRepository;
    private readonly logRepository;
    private readonly configService;
    private readonly logger;
    private readonly transporter;
    sendAppointmentReminder(email: string, details: {
        appointmentId: string;
        patientName: string;
        doctorName: string;
        dateTime: Date;
        location: string;
        notes: string;
        organizationName: string;
    }): Promise<void>;
    constructor(templateRepository: Repository<EmailTemplate>, queueRepository: Repository<EmailQueue>, logRepository: Repository<EmailLog>, configService: ConfigService);
    queueEmail(options: SendEmailOptions): Promise<EmailQueue>;
    processQueue(batchSize?: number): Promise<void>;
    private sendEmail;
    private handleSendError;
    private compileTemplate;
    getEmailLogs(organizationId: string, options?: {
        status?: EmailStatus;
        from?: Date;
        to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<[EmailLog[], number]>;
    updateTrackingStatus(messageId: string, status: EmailStatus, metadata?: Record<string, any>): Promise<void>;
}
export {};
