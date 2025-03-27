import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendSms(to: string, message: string): Promise<void>;
    sendAppointmentReminder(appointment: any): Promise<void>;
    private formatReminderMessage;
}
