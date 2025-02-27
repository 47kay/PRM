// src/modules/sms/sms.service.ts

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

    constructor(
        private readonly configService: ConfigService,
    ) {}

    async sendAppointmentReminder(
        phoneNumber: string,
        data: AppointmentReminderData,
    ): Promise<void> {
        try {
            const message = this.formatReminderMessage(data);
            await this.sendSms(phoneNumber, message);
            
            this.logger.log(`Successfully sent SMS reminder to ${phoneNumber} for appointment ${data.appointmentId}`);
        } catch (error) {
            this.logger.error(`Failed to send SMS reminder to ${phoneNumber}:`, error);
            throw error;
        }
    }

    private async sendSms(to: string, message: string): Promise<void> {
        // Implement your SMS provider integration here
        // Example using Twilio:
        /*
        const twilioClient = new Twilio(
            this.configService.get('TWILIO_ACCOUNT_SID'),
            this.configService.get('TWILIO_AUTH_TOKEN'),
        );

        await twilioClient.messages.create({
            body: message,
            to,
            from: this.configService.get('TWILIO_PHONE_NUMBER'),
        });
        */
    }

    private formatReminderMessage(data: AppointmentReminderData): string {
        const date = data.dateTime.toLocaleDateString();
        const time = data.dateTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return `Hi ${data.patientName}, this is a reminder of your appointment with ${data.organizationName} on ${date} at ${time}. Reply CONFIRM to confirm your attendance.`;
    }
}