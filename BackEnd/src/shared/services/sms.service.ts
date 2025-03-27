import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { Notification } from '../../modules/notifications/entities/notification.entity';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private twilioClient: any; // Changed to any type to allow mock
    private readonly fromNumber: string;
    private mockMode = false;

    constructor(private readonly configService: ConfigService) {
        try {
            const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
            const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
            this.fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER') || '+15555555555'; // Default mock number
            
            if (accountSid && accountSid.startsWith('AC') && authToken) {
                this.twilioClient = twilio(accountSid, authToken);
                this.logger.log('Twilio client initialized successfully');
            } else {
                this.logger.warn('Invalid Twilio credentials - using mock client');
                this.initializeMockClient();
                this.mockMode = true;
            }
        } catch (error) {
            this.logger.warn(`Failed to initialize Twilio client: ${error.message}`);
            this.logger.warn('Using mock client instead');
            this.initializeMockClient();
            this.mockMode = true;
        }
    }

    private initializeMockClient() {
        this.twilioClient = {
            messages: {
                create: async (params: any) => {
                    this.logger.log(`[MOCK] Sending SMS to ${params.to}: ${params.body}`);
                    return {
                        sid: `MOCK_${Date.now()}`,
                        to: params.to,
                        from: params.from,
                        body: params.body,
                        status: 'queued',
                        dateCreated: new Date(),
                        dateUpdated: new Date(),
                        errorMessage: null
                    };
                }
            }
        };
        
        // Mock the messages function to handle message fetching
        const originalMessages = this.twilioClient.messages;
        this.twilioClient.messages = (messageSid: string) => {
            if (typeof messageSid === 'string') {
                return {
                    fetch: async () => {
                        this.logger.log(`[MOCK] Fetching message status for ${messageSid}`);
                        return {
                            sid: messageSid,
                            status: 'delivered',
                            dateCreated: new Date(),
                            dateUpdated: new Date(),
                            errorMessage: null
                        };
                    }
                };
            }
            return originalMessages;
        };
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
        if (this.mockMode) {
            this.logger.log(`[MOCK] Sending SMS to ${phoneNumber}: ${message}`);
            return { 
                success: true,
                sid: `MOCK_${Date.now()}`,
                status: 'sent'
            };
        }
        
        const result = await this.twilioClient.messages.create({
            body: message,
            from: this.fromNumber,
            to: this.formatPhoneNumber(phoneNumber)
        });
        
        return {
            success: true,
            sid: result.sid,
            status: result.status
        };
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