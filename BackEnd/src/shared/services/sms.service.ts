import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { Notification } from '../../modules/notifications/entities/notification.entity';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private readonly twilioClient: twilio.Twilio;
    private readonly fromNumber: string;

    constructor(private readonly configService: ConfigService) {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        
        this.twilioClient = twilio(accountSid, authToken);
        this.fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER') || '';
        if (!this.fromNumber) {
            throw new Error('TWILIO_FROM_NUMBER is not defined in the configuration');
        }
    }

    async send(notification: Notification): Promise<void> {
        try {
            const { recipient, content } = notification;
            
            // Extract phone number from recipient
            const toNumber = this.formatPhoneNumber(recipient.phoneNumber);
            
            // Format content for SMS (strip HTML, limit length, etc.)
            const smsContent = this.formatContent(content);

            // Send SMS via Twilio
            const message = await this.twilioClient.messages.create({
                body: smsContent,
                from: this.fromNumber,
                to: toNumber,
                // Optional parameters based on metadata
                ...this.getOptionalParams(notification.metadata)
            });

            this.logger.debug(`SMS sent to ${toNumber}: ${message.sid}`);

        } catch (error) {
            this.logger.error('Failed to send SMS:', error);
            throw new Error(`SMS delivery failed: ${error.message}`);
        }
    }

    private formatPhoneNumber(phoneNumber: string): string {
        // Remove any non-numeric characters and ensure E.164 format
        const cleaned = phoneNumber.replace(/\D/g, '');
        if (!cleaned.startsWith('1') && cleaned.length === 10) {
            return `+1${cleaned}`;
        }
        return `+${cleaned}`;
    }

    private formatContent(content: string): string {
        // Remove HTML tags
        let smsContent = content.replace(/<[^>]*>/g, '');
        
        // Trim whitespace and normalize spaces
        smsContent = smsContent.replace(/\s+/g, ' ').trim();
        
        // SMS length limit (160 chars for single message)
        if (smsContent.length > 160) {
            smsContent = smsContent.substring(0, 157) + '...';
        }
        
        return smsContent;
    }

    private getOptionalParams(metadata: any = {}) {
        const params: any = {};

        // Handle optional Twilio parameters from metadata
        if (metadata?.statusCallback) {
            params.statusCallback = metadata.statusCallback;
        }

        if (metadata?.mediaUrl) {
            params.mediaUrl = metadata.mediaUrl;
        }

        return params;
    }

    async sendSms(phoneNumber: string, message: string): Promise<any> {
        this.logger.log(`[MOCK] Sending SMS to ${phoneNumber}: ${message}`);
        return { success: true };
    }

    async getDeliveryStatus(messageSid: string) {
        try {
            const message = await this.twilioClient.messages(messageSid).fetch();
            return {
                status: message.status,
                error: message.errorMessage,
                dateCreated: message.dateCreated,
                dateUpdated: message.dateUpdated
            };
        } catch (error) {
            this.logger.error(`Failed to get SMS status for ${messageSid}:`, error);
            throw new Error(`Failed to get SMS status: ${error.message}`);
        }
    }
}