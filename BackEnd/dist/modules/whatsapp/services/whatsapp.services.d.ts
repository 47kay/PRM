import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WhatsAppMessage } from '../entities/whatsapp-message.entity';
import { WhatsappTemplate } from '../entities/whatsapp-template.entity';
import { WhatsAppMediaType } from '../enums/whatsapp-media-type.enum';
interface WhatsAppMessageOptions {
    to: string;
    template?: string;
    parameters?: Record<string, any>;
    mediaUrl?: string;
    mediaType?: WhatsAppMediaType;
    text?: string;
    replyToMessageId?: string;
    metadata?: Record<string, any>;
}
export declare class WhatsappService {
    private readonly configService;
    private readonly eventEmitter;
    private readonly messageRepository;
    private readonly templateRepository;
    private readonly logger;
    private readonly client;
    private readonly maxRetries;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2, messageRepository: Repository<WhatsAppMessage>, templateRepository: Repository<WhatsappTemplate>);
    sendAppointmentReminder(whatsappNumber: string, data: {
        appointmentId: string;
        patientName: string;
        doctorName: string;
        dateTime: Date;
        location: string;
        organizationName: string;
    }): Promise<void>;
    sendMessage(options: WhatsAppMessageOptions): Promise<WhatsAppMessage>;
    private prepareTemplateMessage;
    private prepareMediaMessage;
    private prepareTextMessage;
    private buildTemplateComponents;
    private formatParameters;
    handleWebhook(data: any): Promise<void>;
    private handleIncomingMessages;
    private handleMessageStatuses;
    private mapWhatsAppStatus;
    private formatPhoneNumber;
    private isValidPhoneNumber;
    getMessageStatus(messageId: string): Promise<WhatsAppMessage | null>;
    retryFailedMessages(): Promise<void>;
}
export {};
