import { Queue, Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { EmailLog } from '../modules/email/entities/email-log.entity';
interface EmailJob {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, any>;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
        contentType?: string;
    }>;
    priority?: number;
    organizationId?: string;
    userId?: string;
}
export declare class EmailQueueJob {
    private readonly emailQueue;
    private readonly emailLogRepository;
    private readonly mailerService;
    private readonly configService;
    private readonly logger;
    constructor(emailQueue: Queue<EmailJob>, emailLogRepository: Repository<EmailLog>, mailerService: MailerService, configService: ConfigService);
    processEmailJob(job: Job<EmailJob>): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    private checkRateLimit;
    private logEmail;
    private isRetryableError;
    addToQueue(data: EmailJob): Promise<Job<EmailJob>>;
    addBulkToQueue(emails: EmailJob[]): Promise<Job<EmailJob>[]>;
    getQueueStatus(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    }>;
    cleanupOldJobs(): Promise<void>;
}
export {};
