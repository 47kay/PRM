import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import { MessageStatus, WhatsAppMessage } from '../entities/whatsapp-message.entity';
import { WhatsappTemplate, WhatsappTemplateComponent, WhatsappTemplateHeaderType, WhatsappTemplateButton, WhatsappTemplateComponentType } from '../entities/whatsapp-template.entity';
import { WhatsAppMediaType } from '../enums/whatsapp-media-type.enum';
import { WhatsAppMessageStatus } from '../enums/whatsapp-message-status.enum';

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
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);
    private readonly client: AxiosInstance;
    private readonly maxRetries = 3;

    constructor(
        private readonly configService: ConfigService,
        private readonly eventEmitter: EventEmitter2,
        @InjectRepository(WhatsAppMessage)
        private readonly messageRepository: Repository<WhatsAppMessage>,
        @InjectRepository(WhatsappTemplate)
        private readonly templateRepository: Repository<WhatsappTemplate>
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

    async sendAppointmentReminder(
        whatsappNumber: string,
        data: {
            appointmentId: string;
            patientName: string;
            doctorName: string;
            dateTime: Date;
            location: string;
            organizationName: string;
        },
    ): Promise<void> {
        try {
            const template = await this.templateRepository.findOne({
                where: { name: 'appointment_reminder' }
            });

            if (!template) {
                throw new Error('Appointment reminder template not found');
            }

            await this.sendMessage({
                to: whatsappNumber,
                template: 'appointment_reminder',
                parameters: {
                    header: data.organizationName,
                    body: {
                        patientName: data.patientName,
                        doctorName: data.doctorName,
                        dateTime: data.dateTime.toLocaleString(),
                        location: data.location
                    }
                },
                metadata: {
                    appointmentId: data.appointmentId,
                    type: 'APPOINTMENT_REMINDER'
                }
            });

        } catch (error) {
            this.logger.error(`Failed to send WhatsApp reminder to ${whatsappNumber}:`, error);
            throw error;
        }
    }
    async sendMessage(options: WhatsAppMessageOptions): Promise<WhatsAppMessage> {
        try {
            // Format phone number
            const formattedNumber = this.formatPhoneNumber(options.to);

            // Validate phone number
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

            // Create message record
            const message = this.messageRepository.create({
                to: formattedNumber,
                messageType: options.template ? 'template' : options.mediaUrl ? 'media' : 'text',
                content: messageData,
                metadata: options.metadata,
                status: this.mapWhatsAppStatus(WhatsAppMessageStatus.PENDING) as unknown as MessageStatus,
                retryCount: 0,
            });

            await this.messageRepository.save(message);

            // Send message
            const response = await this.client.post('/messages', {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedNumber,
                ...messageData,
            });

            // Update message with WhatsApp message ID
            message.whatsappMessageId = response.data.messages[0].id;
            message.status = this.mapWhatsAppStatus(WhatsAppMessageStatus.SENT) as unknown as MessageStatus;
            message.sentAt = new Date();
            await this.messageRepository.save(message);

            // Emit event
            this.eventEmitter.emit('whatsapp.message.sent', message);

            return message;
        } catch (error) {
            this.logger.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }

    private async prepareTemplateMessage(options: WhatsAppMessageOptions): Promise<any> {
        const template = await this.templateRepository.findOne({
            where: { name: options.template }
        });

        if (!template) {
            throw new Error(`Template not found: ${options.template}`);
        }

        return {
            type: 'template',
            template: {
                name: template.name,
                language: {
                    code: template.language
                },
                components: this.buildTemplateComponents(template, options.parameters)
            }
        };
    }

    private async prepareMediaMessage(options: WhatsAppMessageOptions): Promise<any> {
        if (!options.mediaType) {
            throw new Error('Media type is required for media messages');
        }

        return {
            type: options.mediaType.toLowerCase(),
            [options.mediaType.toLowerCase()]: {
                link: options.mediaUrl
            },
            text: options.text
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
                preview_url: true
            }
        };
    }

    private buildTemplateComponents(
        template: WhatsappTemplate,
        parameters?: Record<string, any>
    ): any[] {
        const components = [];

        // Find header component if it exists
        const headerComponent = template.components.find(c => 
            c.type === WhatsappTemplateComponentType.HEADER
        );

        if (headerComponent && parameters?.header) {
            components.push({
                type: 'header',
                parameters: this.formatParameters(headerComponent.format || WhatsappTemplateHeaderType.TEXT, parameters.header)
            });
        }

        if (parameters?.body) {
            components.push({
                type: 'body',
                parameters: this.formatParameters('text', parameters.body)
            });
        }

        // Find button component if it exists
        const buttonComponent = template.components.find(c => 
            c.type === WhatsappTemplateComponentType.BUTTONS
        );
        
        if (buttonComponent?.buttons && parameters?.buttons) {
            components.push({
                type: 'button',
                sub_type: 'quick_reply',
                index: 0,
                parameters: parameters.buttons
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
                // Create message record for incoming message
                const incomingMessage = this.messageRepository.create({
                    whatsappMessageId: message.id,
                    from: message.from,
                    messageType: message.type,
                    content: message,
                    status: this.mapWhatsAppStatus(WhatsAppMessageStatus.RECEIVED) as unknown as MessageStatus,
                    receivedAt: new Date(),
                });

                await this.messageRepository.save(incomingMessage);

                // Emit event
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
                    where: { whatsappMessageId: status.id }
                });

                if (message) {
                    message.status = this.mapWhatsAppStatus(status.status) as unknown as MessageStatus;
                    message.deliveredAt = status.status === 'delivered' ? new Date() : null;
                    message.readAt = status.status === 'read' ? new Date() : null;
                    await this.messageRepository.save(message);

                    // Emit event
                    this.eventEmitter.emit('whatsapp.message.status_updated', message);
                }
            } catch (error) {
                this.logger.error('Error processing WhatsApp message status:', error);
            }
        }
    }

    private mapWhatsAppStatus(status: string): MessageStatus {
        // Create a mapping from WhatsApp API status to our enum
        const statusMapping: Record<string, WhatsAppMessageStatus> = {
            'sent': WhatsAppMessageStatus.SENT,
            'delivered': WhatsAppMessageStatus.DELIVERED,
            'read': WhatsAppMessageStatus.READ,
            'failed': WhatsAppMessageStatus.FAILED,
            'pending': WhatsAppMessageStatus.PENDING
        };
        
        // Get the mapped status or default to UNKNOWN
        const mappedStatus = statusMapping[status.toLowerCase()] || WhatsAppMessageStatus.UNKNOWN;
        
        // Cast to MessageStatus (assuming they share the same string values)
        return mappedStatus as unknown as MessageStatus;
    }

    private formatPhoneNumber(phone: string): string {
        // Remove any non-numeric characters
        const cleaned = phone.replace(/\D/g, '');
        
        // Ensure number starts with country code
        if (!cleaned.startsWith('1') && cleaned.length === 10) {
            return `1${cleaned}`;
        }
        
        return cleaned;
    }

    private isValidPhoneNumber(phone: string): boolean {
        // Basic validation for E.164 format
        return /^\d{11,15}$/.test(phone);
    }

    async getMessageStatus(messageId: string): Promise<WhatsAppMessage | null> {
        try {
            return await this.messageRepository.findOne({
                where: { id: messageId }
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
                    status: WhatsAppMessageStatus.FAILED as unknown as MessageStatus,
                    retryCount: LessThan(this.maxRetries)
                }
            });

            for (const message of failedMessages) {
                try {
                    const response = await this.client.post('/messages', message.content);
                    
                    message.whatsappMessageId = response.data.messages[0].id;
                    message.status = this.mapWhatsAppStatus(WhatsAppMessageStatus.SENT) as unknown as MessageStatus;
                    message.sentAt = new Date();
                    message.retryCount += 1;
                    
                    await this.messageRepository.save(message);
                } catch (error) {
                    this.logger.error(`Error retrying message ${message.id}:`, error);
                    
                    message.retryCount += 1;
                    message.lastError = error.message;
                    
                    if (message.retryCount >= this.maxRetries) {
                        message.status = this.mapWhatsAppStatus(WhatsAppMessageStatus.PERMANENTLY_FAILED) as unknown as MessageStatus;
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