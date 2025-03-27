// src/modules/sms/services/sms.service.ts

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

    constructor(private readonly configService: ConfigService) {}

    /**
     * Send an SMS message
     * @param to Recipient phone number
     * @param message SMS message content
     */
    async sendSms(to: string, message: string): Promise<void> {
        this.logger.log(`[MOCK] Sending SMS to ${to}`);

        // Implement your SMS sending logic here
        // This is a placeholder implementation

        this.logger.debug('SMS content:', message);
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
}