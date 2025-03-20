import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WhatsAppMessage } from '../../modules/whatsapp/entities/whatsapp-message.entity';
import { WhatsappTemplate } from '../../modules/whatsapp/entities/whatsapp-template.entity';
import { WhatsAppMediaType } from '../../modules/whatsapp/enums/whatsapp-media-type.enum';
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
export declare class WhatsAppService {
    private readonly configService;
    private readonly eventEmitter;
    private readonly messageRepository;
    private readonly templateRepository;
    private readonly logger;
    private readonly client;
    private readonly maxRetries;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2, messageRepository: Repository<WhatsAppMessage>, templateRepository: Repository<WhatsappTemplate>);
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
