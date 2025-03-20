import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import { WhatsAppMessage, MessageStatus, MessageDirection } from '../../modules/whatsapp/entities/whatsapp-message.entity'; // Import MessageDirection
import { WhatsappTemplate } from '../../modules/whatsapp/entities/whatsapp-template.entity';
import { WhatsAppMediaType } from '../../modules/whatsapp/enums/whatsapp-media-type.enum';
import { WhatsAppMessageStatus } from '../../modules/whatsapp/enums/whatsapp-message-status.enum';

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

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);
    private readonly client: AxiosInstance;
    private readonly maxRetries = 3;

    constructor(
        private readonly configService: ConfigService,
        private readonly eventEmitter: EventEmitter2,
        @InjectRepository(WhatsAppMessage)
        private readonly messageRepository: Repository<WhatsAppMessage>,
        @InjectRepository(WhatsappTemplate)
        private readonly templateRepository: Repository<WhatsappTemplate>,
    ) {
        this.client = axios.create({
            baseURL: this.configService.get('WHATSAPP_API_URL'),
            headers: {
                'Authorization': `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
    }

    async sendMessage(options: WhatsAppMessageOptions): Promise<WhatsAppMessage> {
        try {
            const formattedNumber = this.formatPhoneNumber(options.to);

            if (!this.isValidPhoneNumber(formattedNumber)) {
                throw new Error(`Invalid phone number: ${options.to}`);
            }

            let messageData: any;

            if (options.template) {
                messageData = await this.prepareTemplateMessage(options);
            } else if (options.mediaUrl) {
                messageData = await this.prepareMediaMessage(options);
            } else {
                messageData = this.prepareTextMessage(options);
            }

            const message = this.messageRepository.create({
                to: formattedNumber,
                messageType: options.template ? 'template' : options.mediaUrl ? 'media' : 'text',
                content: JSON.stringify(messageData),
                metadata: options.metadata,
                status: MessageStatus.QUEUED,
                retryCount: 0,
                recipientPhone: formattedNumber,
            });

            await this.messageRepository.save(message);

            const response = await this.client.post('/messages', {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedNumber,
                ...messageData,
            });

            message.whatsappMessageId = response.data.messages[0].id;
            message.status = MessageStatus.SENT;
            message.sentAt = new Date();
            await this.messageRepository.save(message);

            this.eventEmitter.emit('whatsapp.message.sent', message);

            return message;
        } catch (error) {
            this.logger.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }

    private async prepareTemplateMessage(options: WhatsAppMessageOptions): Promise<any> {
        const template = await this.templateRepository.findOne({
            where: { name: options.template },
        });

        if (!template) {
            throw new Error(`Template not found: ${options.template}`);
        }

        return {
            type: 'template',
            template: {
                name: template.name,
                language: {
                    code: template.language,
                },
                components: this.buildTemplateComponents(template, options.parameters),
            },
        };
    }

    private async prepareMediaMessage(options: WhatsAppMessageOptions): Promise<any> {
        if (!options.mediaType) {
            throw new Error('Media type is required for media messages');
        }

        return {
            type: options.mediaType.toLowerCase(),
            [options.mediaType.toLowerCase()]: {
                link: options.mediaUrl,
            },
            text: options.text,
        };
    }

    private prepareTextMessage(options: WhatsAppMessageOptions): any {
        if (!options.text) {
            throw new Error('Text is required for text messages');
        }

        return {
            type: 'text',
            text: {
                body: options.text,
                preview_url: true,
            },
        };
    }

    private buildTemplateComponents(template: WhatsappTemplate, parameters?: Record<string, any>): any[] {
        const components = [];

        if (parameters?.header) {
            components.push({
                type: 'header',
                parameters: this.formatParameters('text', parameters.header),
            });
        }

        if (parameters?.body) {
            components.push({
                type: 'body',
                parameters: this.formatParameters('text', parameters.body),
            });
        }

        if (parameters?.buttons) {
            components.push({
                type: 'button',
                sub_type: 'quick_reply',
                index: 0,
                parameters: parameters.buttons,
            });
        }

        return components;
    }

    private formatParameters(type: string, value: any): any[] {
        switch (type) {
            case 'text':
                return [{ type: 'text', text: value }];
            case 'image':
                return [{ type: 'image', image: { link: value } }];
            case 'document':
                return [{ type: 'document', document: { link: value } }];
            case 'video':
                return [{ type: 'video', video: { link: value } }];
            default:
                return [{ type: 'text', text: value }];
        }
    }

    async handleWebhook(data: any): Promise<void> {
        try {
            const { entry } = data;

            for (const e of entry) {
                for (const change of e.changes) {
                    if (change.value.messages) {
                        await this.handleIncomingMessages(change.value.messages);
                    }
                    if (change.value.statuses) {
                        await this.handleMessageStatuses(change.value.statuses);
                    }
                }
            }
        } catch (error) {
            this.logger.error('Error processing WhatsApp webhook:', error);
            throw error;
        }
    }

    private async handleIncomingMessages(messages: any[]): Promise<void> {
        for (const message of messages) {
            try {
                const incomingMessage = this.messageRepository.create({
                    whatsappMessageId: message.id,
                    from: message.from,
                    messageType: message.type,
                    content: JSON.stringify(message),
                    status: MessageStatus.QUEUED,
                    receivedAt: new Date(),
                    recipientPhone: message.from,
                    direction: MessageDirection.INBOUND, // Use enum value
                });

                await this.messageRepository.save(incomingMessage);

                this.eventEmitter.emit('whatsapp.message.received', incomingMessage);
            } catch (error) {
                this.logger.error('Error processing incoming WhatsApp message:', error);
            }
        }
    }

    private async handleMessageStatuses(statuses: any[]): Promise<void> {
        for (const status of statuses) {
            try {
                const message = await this.messageRepository.findOne({
                    where: { whatsappMessageId: status.id },
                });

                if (message) {
                    message.status = this.mapWhatsAppStatus(status.status);
                    message.deliveredAt = status.status === 'delivered' ? new Date() : message.deliveredAt;
                    message.readAt = status.status === 'read' ? new Date() : message.readAt;
                    await this.messageRepository.save(message);

                    this.eventEmitter.emit('whatsapp.message.status_updated', message);
                }
            } catch (error) {
                this.logger.error('Error processing WhatsApp message status:', error);
            }
        }
    }

    private mapWhatsAppStatus(status: string): MessageStatus {
        switch (status.toLowerCase()) {
            case 'sent':
                return MessageStatus.SENT;
            case 'delivered':
                return MessageStatus.DELIVERED;
            case 'read':
                return MessageStatus.READ;
            case 'failed':
                return MessageStatus.FAILED;
            default:
                return MessageStatus.UNKNOWN;
        }
    }

    private formatPhoneNumber(phone: string): string {
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned.startsWith('1') && cleaned.length === 10) {
            return `1${cleaned}`;
        }
        return cleaned;
    }

    private isValidPhoneNumber(phone: string): boolean {
        return /^\d{11,15}$/.test(phone);
    }

    async getMessageStatus(messageId: string): Promise<WhatsAppMessage | null> {
        try {
            return await this.messageRepository.findOne({
                where: { id: messageId },
            });
        } catch (error) {
            this.logger.error(`Error getting message status for ${messageId}:`, error);
            throw error;
        }
    }

    async retryFailedMessages(): Promise<void> {
        try {
            const failedMessages = await this.messageRepository.find({
                where: {
                    status: MessageStatus.FAILED,
                    retryCount: LessThan(this.maxRetries),
                },
            });

            for (const message of failedMessages) {
                try {
                    const content = JSON.parse(message.content);
                    const response = await this.client.post('/messages', content);

                    message.whatsappMessageId = response.data.messages[0].id;
                    message.status = MessageStatus.SENT;
                    message.sentAt = new Date();
                    message.retryCount += 1;

                    await this.messageRepository.save(message);
                } catch (error) {
                    this.logger.error(`Error retrying message ${message.id}:`, error);

                    message.retryCount += 1;
                    message.lastError = error.message || String(error);

                    if (message.retryCount >= this.maxRetries) {
                        message.status = MessageStatus.FAILED;
                        message.metadata = { 
                            ...message.metadata, 
                            permanentlyFailed: true 
                        };
                    }

                    await this.messageRepository.save(message);
                }
            }
        } catch (error) {
            this.logger.error('Error retrying failed messages:', error);
            throw error;
        }
    }
}