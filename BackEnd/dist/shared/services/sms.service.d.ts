import { ConfigService } from '@nestjs/config';
import { Notification } from '../../modules/notifications/entities/notification.entity';
export declare class SmsService {
    private readonly configService;
    private readonly logger;
    private twilioClient;
    private readonly fromNumber;
    private mockMode;
    constructor(configService: ConfigService);
    private initializeMockClient;
    send(notification: Notification): Promise<void>;
    private formatPhoneNumber;
    private formatContent;
    private getOptionalParams;
    sendSms(phoneNumber: string, message: string): Promise<any>;
    getDeliveryStatus(messageSid: string): Promise<{
        status: any;
        error: any;
        dateCreated: any;
        dateUpdated: any;
    }>;
}
