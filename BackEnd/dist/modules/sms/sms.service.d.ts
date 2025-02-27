import { ConfigService } from '@nestjs/config';
interface AppointmentReminderData {
    appointmentId: string;
    patientName: string;
    dateTime: Date;
    organizationName: string;
}
export declare class SmsService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendAppointmentReminder(phoneNumber: string, data: AppointmentReminderData): Promise<void>;
    private sendSms;
    private formatReminderMessage;
}
export {};
