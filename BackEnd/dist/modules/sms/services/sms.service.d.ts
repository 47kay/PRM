import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private readonly configService;
    private readonly logger;
    private twilioClient;
    private mockMode;
    constructor(configService: ConfigService);
    private initializeTwilioClient;
    sendSms(to: string, message: string): Promise<any>;
    private sendMockSms;
    sendAppointmentReminder(appointment: any): Promise<void>;
    private formatReminderMessage;
    isMockMode(): boolean;
}
