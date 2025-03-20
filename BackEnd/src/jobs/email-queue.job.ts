// src/jobs/email-queue.job.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
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

@Injectable()
@Processor('email')
export class EmailQueueJob {
    private readonly logger = new Logger(EmailQueueJob.name);

    constructor(
        @InjectQueue('email') private readonly emailQueue: Queue<EmailJob>,
        @InjectRepository(EmailLog)
        private readonly emailLogRepository: Repository<EmailLog>,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}

    @Process('send')
    async processEmailJob(job: Job<EmailJob>) {
        const { data } = job;
        
        try {
            this.logger.debug(`Processing email job ${job.id} to ${data.to}`);

            // Check rate limits
            await this.checkRateLimit(data.organizationId);

            // Send email
            await this.mailerService.sendMail({
                to: data.to,
                subject: data.subject,
                template: data.template,
                context: data.context,
                cc: data.cc,
                bcc: data.bcc,
                attachments: data.attachments,
            });

            // Log success
            await this.logEmail({
                jobId: job.id.toString(),
                to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
                subject: data.subject,
                template: data.template,
                status: 'SUCCESS',
                organizationId: data.organizationId,
                userId: data.userId,
            });

            return { success: true };
        } catch (error) {
            // Log failure
            await this.logEmail({
                jobId: job.id.toString(),
                to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
                subject: data.subject,
                template: data.template,
                status: 'FAILED',
                error: error.message,
                organizationId: data.organizationId,
                userId: data.userId,
            });

            // Handle specific errors
            if (this.isRetryableError(error)) {
                throw error; // Bull will retry based on configuration
            }

            this.logger.error(`Failed to process email job ${job.id}:`, error);
            return { success: false, error: error.message };
        }
    }

    private async checkRateLimit(organizationId?: string): Promise<void> {
        if (!organizationId) return;

        const key = `email:ratelimit:${organizationId}`;
        const limit = this.configService.get<number>('email.rateLimit.perHour') || 100;
        
        // TypeORM query using MoreThanOrEqual for date comparison
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const count = await this.emailLogRepository.count({
            where: {
                organizationId,
                createdAt: MoreThanOrEqual(oneHourAgo)
            },
        });

        if (count >= limit) {
            throw new Error('Rate limit exceeded');
        }
    }

    private async logEmail(data: Partial<EmailLog>): Promise<void> {
        try {
            await this.emailLogRepository.save({
                ...data,
                createdAt: new Date(),
            });
        } catch (error) {
            this.logger.error('Failed to log email:', error);
        }
    }

    private isRetryableError(error: any): boolean {
        return [
            'ECONNREFUSED',
            'ECONNRESET',
            'ETIMEDOUT',
            'ESOCKET',
        ].includes(error.code) || error.message.includes('rate limit');
    }

    // Queue management methods
    async addToQueue(data: EmailJob): Promise<Job<EmailJob>> {
        return this.emailQueue.add('send', data, {
            priority: data.priority || 0,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });
    }

    async addBulkToQueue(emails: EmailJob[]): Promise<Job<EmailJob>[]> {
        const jobs = emails.map(email => ({
            name: 'send',
            data: email,
            opts: {
                priority: email.priority || 0,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        }));

        return this.emailQueue.addBulk(jobs);
    }

    // Monitoring methods
    async getQueueStatus() {
        const [waiting, active, completed, failed] = await Promise.all([
            this.emailQueue.getWaitingCount(),
            this.emailQueue.getActiveCount(),
            this.emailQueue.getCompletedCount(),
            this.emailQueue.getFailedCount(),
        ]);

        return {
            waiting,
            active,
            completed,
            failed,
        };
    }

    async cleanupOldJobs() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await this.emailQueue.clean(30 * 24 * 60 * 60 * 1000, 'completed');
        await this.emailQueue.clean(30 * 24 * 60 * 60 * 1000, 'failed');
        
        // Clean up logs using TypeORM's LessThan operator
        await this.emailLogRepository.delete({
            createdAt: LessThan(thirtyDaysAgo)
        });
    }
}