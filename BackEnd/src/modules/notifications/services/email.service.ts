import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
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

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  async sendAppointmentReminder(email: string, details: {
    appointmentId: string;
    patientName: string;
    doctorName: string;
    dateTime: Date;
    location: string;
    notes: string;
    organizationName: string;
  }): Promise<void> {
    // Implementation for sending email reminder
    // Example:
    console.log(`Sending email to ${email} with details:`, details);
  }

  constructor(
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
    @InjectRepository(EmailQueue)
    private readonly queueRepository: Repository<EmailQueue>,
    @InjectRepository(EmailLog)
    private readonly logRepository: Repository<EmailLog>,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  /**
   * Queue an email for sending
   */
  async queueEmail(options: SendEmailOptions): Promise<EmailQueue> {
    let htmlContent = options.htmlContent;
    let textContent = options.textContent;

    // If template is specified, fetch and compile it
    if (options.template) {
      const template = await this.templateRepository.findOne({
        where: {
          name: options.template,
          organizationId: options.organizationId,
          isActive: true
        }
      });

      if (template) {
        htmlContent = this.compileTemplate(template.htmlContent, options.variables);
        textContent = template.textContent ?
          this.compileTemplate(template.textContent, options.variables) :
          undefined;
      }
    }

    // Create queue entry
    const queueEntry = this.queueRepository.create({
      recipient: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      htmlContent,
      textContent,
      variables: options.variables,
      metadata: options.metadata,
      organizationId: options.organizationId,
      scheduledFor: options.scheduledFor,
      status: EmailStatus.PENDING,
    });

    return this.queueRepository.save(queueEntry);
  }

  /**
   * Process queued emails
   */
  async processQueue(batchSize: number = 50): Promise<void> {
    const queuedEmails = await this.queueRepository.find({
      where: [
        { status: EmailStatus.PENDING, scheduledFor: IsNull() },
        {
          status: EmailStatus.PENDING,
          scheduledFor: LessThanOrEqual(new Date())
        }
      ],
      take: batchSize,
      order: { createdAt: 'ASC' }
    });

    for (const email of queuedEmails) {
      try {
        await this.sendEmail(email);
      } catch (error) {
        this.logger.error(`Failed to send email ${email.id}:`, error);
        await this.handleSendError(email, error);
      }
    }
  }

  /**
   * Send a single email
   */
  private async sendEmail(queuedEmail: EmailQueue): Promise<void> {
    // Update status to sending
    await this.queueRepository.update(queuedEmail.id, {
      status: EmailStatus.SENDING,
      attempts: () => '"attempts" + 1'
    });

    // Prepare email data
    const mailOptions = {
      from: this.configService.get('MAIL_FROM'),
      to: queuedEmail.recipient,
      subject: queuedEmail.subject,
      html: queuedEmail.htmlContent,
      text: queuedEmail.textContent,
    };

    try {
      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      // Create log entry
      const logEntry = this.logRepository.create({
        organizationId: queuedEmail.organizationId,
        templateId: queuedEmail.templateId,
        recipient: queuedEmail.recipient,
        subject: queuedEmail.subject,
        htmlContent: queuedEmail.htmlContent,
        textContent: queuedEmail.textContent,
        metadata: queuedEmail.metadata,
        status: EmailStatus.SENT,
        messageId: result.messageId,
        sentAt: new Date(),
      });

      await this.logRepository.save(logEntry);

      // Remove from queue
      await this.queueRepository.delete(queuedEmail.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle email send errors
   */
  private async handleSendError(email: EmailQueue, error: any): Promise<void> {
    const maxAttempts = this.configService.get('EMAIL_MAX_ATTEMPTS', 3);

    if (email.attempts >= maxAttempts) {
      // Create failed log entry
      const logEntry = this.logRepository.create({
        organizationId: email.organizationId,
        templateId: email.templateId,
        recipient: email.recipient,
        subject: email.subject,
        htmlContent: email.htmlContent,
        textContent: email.textContent,
        metadata: email.metadata,
        status: EmailStatus.FAILED,
        error: error.message,
        sentAt: new Date(),
      });

      await this.logRepository.save(logEntry);
      await this.queueRepository.delete(email.id);
    } else {
      // Update queue entry with error
      await this.queueRepository.update(email.id, {
        status: EmailStatus.PENDING,
        lastError: error.message,
      });
    }
  }

  /**
   * Compile template with variables
   */
  private compileTemplate(template: string, variables: Record<string, any> = {}): string {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(variables);
  }

  /**
   * Get email logs for an organization
   */
  async getEmailLogs(
    organizationId: string,
    options: {
      status?: EmailStatus;
      from?: Date;
      to?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<[EmailLog[], number]> {
    const query = this.logRepository.createQueryBuilder('log')
      .where('log.organizationId = :organizationId', { organizationId });

    if (options.status) {
      query.andWhere('log.status = :status', { status: options.status });
    }

    if (options.from) {
      query.andWhere('log.createdAt >= :from', { from: options.from });
    }

    if (options.to) {
      query.andWhere('log.createdAt <= :to', { to: options.to });
    }

    return query
      .orderBy('log.createdAt', 'DESC')
      .take(options.limit || 50)
      .skip(options.offset || 0)
      .getManyAndCount();
  }

  /**
   * Update email tracking status
   */
  async updateTrackingStatus(
    messageId: string,
    status: EmailStatus,
    metadata?: Record<string, any>
  ): Promise<void> {
    const log = await this.logRepository.findOne({
      where: { messageId }
    });

    if (!log) {
      return;
    }

    const update: Partial<EmailLog> = { status };

    switch (status) {
      case EmailStatus.DELIVERED:
        update.deliveredAt = new Date();
        break;
      case EmailStatus.OPENED:
        update.openedAt = new Date();
        break;
      case EmailStatus.CLICKED:
        update.clickedAt = new Date();
        break;
    }

    if (metadata) {
      update.metadata = { ...log.metadata, ...metadata };
    }

    await this.logRepository.update(log.id, update);
  }
}