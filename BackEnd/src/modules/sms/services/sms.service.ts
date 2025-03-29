import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AppointmentReminderData {
    appointmentId: string;
    patientName: string;
    dateTime: Date;
    organizationName: string;
}

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private twilioClient: any = null;
    private mockMode = false;

    constructor(private readonly configService: ConfigService) {
        this.initializeTwilioClient();
    }

    private initializeTwilioClient(): void {
        try {
            const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
            const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
            const phoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

            // Check for mock configuration
            if (accountSid === 'mock' || authToken === 'mock') {
                this.logger.warn('Mock Twilio configuration detected - using mock client');
                this.mockMode = true;
                return;
            }

            // Check if credentials are present
            if (!accountSid || !authToken || !phoneNumber) {
                this.logger.warn('Invalid Twilio credentials - using mock client');
                this.mockMode = true;
                return;
            }

            // Try to initialize the Twilio client
            try {
                const twilio = require('twilio');
                this.twilioClient = twilio(accountSid, authToken);
                this.logger.log('Twilio client initialized successfully');
            } catch (error) {
                this.logger.warn(`Failed to initialize Twilio client: ${error.message}`);
                this.mockMode = true;
            }
        } catch (error) {
            this.logger.warn(`Error setting up Twilio: ${error.message}`);
            this.mockMode = true;
        }
    }

    /**
     * Send an SMS message
     * @param to Recipient phone number
     * @param message SMS message content
     */
    async sendSms(to: string, message: string): Promise<any> {
        if (this.mockMode || !this.twilioClient) {
            return this.sendMockSms(to, message);
        }

        try {
            const fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
            
            const result = await this.twilioClient.messages.create({
                body: message,
                from: fromNumber,
                to: to
            });
            
            this.logger.log(`SMS sent to ${to} with SID: ${result.sid}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to send SMS through Twilio: ${error.message}`);
            // Fallback to mock if the real service fails
            return this.sendMockSms(to, message);
        }
    }

    private sendMockSms(to: string, message: string): any {
        this.logger.log(`[MOCK] Sending SMS to ${to}`);
        this.logger.debug('[MOCK] SMS content:', message);
        
        return {
            sid: `MOCK_SMS_${Date.now()}`,
            status: 'delivered',
            dateCreated: new Date(),
            to: to,
            body: message
        };
    }

    /**
     * Send an appointment reminder
     * @param appointment The appointment data
     */
    async sendAppointmentReminder(appointment: any): Promise<void> {
        const reminderData: AppointmentReminderData = {
            appointmentId: appointment.id,
            patientName: appointment.contact?.firstName || 'Patient',
            dateTime: appointment.dateTime || new Date(),
            organizationName: appointment.organization?.name || 'Healthcare Provider'
        };

        const message = this.formatReminderMessage(reminderData);
        const phoneNumber = appointment.contact?.phone;

        if (!phoneNumber) {
            this.logger.warn(`No phone number available for appointment ${appointment.id}`);
            return;
        }

        await this.sendSms(phoneNumber, message);
    }

    private formatReminderMessage(data: AppointmentReminderData): string {
        const date = data.dateTime.toLocaleDateString();
        const time = data.dateTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `Hi ${data.patientName}, this is a reminder of your appointment with ${data.organizationName} on ${date} at ${time}. Reply CONFIRM to confirm your attendance.`;
    }

    isMockMode(): boolean {
        return this.mockMode;
    }
}