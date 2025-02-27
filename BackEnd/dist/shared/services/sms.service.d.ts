import { ConfigService } from '@nestjs/config';
import { Notification } from '../../modules/notifications/entities/notification.entity';
export declare class SmsService {
    private readonly configService;
    private readonly logger;
    private readonly twilioClient;
    private readonly fromNumber;
    constructor(configService: ConfigService);
    send(notification: Notification): Promise<void>;
    private formatPhoneNumber;
    private formatContent;
    private getOptionalParams;
    getDeliveryStatus(messageSid: string): Promise<{
        status: import("twilio/lib/rest/api/v2010/account/message").MessageStatus;
        error: string;
        dateCreated: Date;
        dateUpdated: Date;
    }>;
}
