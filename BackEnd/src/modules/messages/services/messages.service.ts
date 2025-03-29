// src/modules/messages/services/messages.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Not, IsNull, SaveOptions, QueryRunner } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MessageTemplate } from '../entities/message-template.entity';
import { MessageAttachment } from '../entities/message-attachment.entity';
import { CreateMessageDto, MessageType, MessageStatus, Attachment } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MessageQueryDto } from '../dto/message-query.dto';
import { MessageTemplateDto } from '../dto/message-template.dto';
import { BulkMessageDto } from '../dto/bulk-message.dto';
import { Contact } from '../../contacts/entities/contact.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { paginate } from 'nestjs-typeorm-paginate';
import { DeepPartial } from 'typeorm';
import { TemplateCategory } from '../entities/template-category.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Helper interface for transaction operations
 */
interface TransactionCallback<T> {
    (queryRunner: QueryRunner): Promise<T>;
}

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(MessageTemplate)
        private readonly templateRepository: Repository<MessageTemplate>,
        @InjectRepository(MessageAttachment)
        private readonly attachmentRepository: Repository<MessageAttachment>,
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly dataSource: DataSource,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    /**
     * Helper method to convert an entity to a Promise
     */
    private asPromiseEntity<T>(entity: T): Promise<T> {
        return Promise.resolve(entity);
    }

    /**
     * Execute a database operation within a transaction
     */
    private async withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await callback(queryRunner);
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Validate and fetch a contact
     */
    private async getValidContact(contactId: string, organizationId: string, messageType?: MessageType): Promise<Contact> {
        const contact = await this.contactRepository.findOne({
            where: { id: contactId, organizationId },
        });

        if (!contact) {
            throw new NotFoundException(`Contact with ID ${contactId} not found`);
        }

        // Validate contact info for specific message types
        if (messageType === MessageType.EMAIL && !contact.email) {
            throw new BadRequestException('Contact has no email address');
        }
        if (messageType === MessageType.SMS && !contact.phoneNumber) {
            throw new BadRequestException('Contact has no phone number');
        }

        return contact;
    }

    /**
     * Get a user by ID
     */
    private async getUser(userId: string, errorContext: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException(`${errorContext} with ID ${userId} not found`);
        }

        return user;
    }

    /**
     * Prepare email options
     */
    private prepareEmailOptions(data: CreateMessageDto): any {
        if (data.type !== MessageType.EMAIL) {
            return undefined;
        }

        return {
            subject: data.emailOptions?.subject || 'No Subject',
            cc: data.emailOptions?.cc,
            bcc: data.emailOptions?.bcc,
            trackOpens: data.emailOptions?.trackOpens,
            trackClicks: data.emailOptions?.trackClicks
        };
    }

    /**
     * Apply template content if template ID is provided
     */
    private async applyTemplate(
        message: Message, 
        templateId: string | undefined, 
        organizationId: string, 
        contact: Contact
    ): Promise<void> {
        if (!templateId) return;

        const template = await this.templateRepository.findOne({
            where: { id: templateId, organizationId },
        });

        if (!template) {
            throw new NotFoundException(`Template with ID ${templateId} not found`);
        }

        message.content = this.processTemplate(template.content, contact);
    }

    /**
     * Create message attachments
     */
    private createAttachmentEntities(
        attachments: Attachment[] | undefined, 
        message: Message
    ): MessageAttachment[] {
        if (!attachments || attachments.length === 0) {
            return [];
        }

        return attachments.map(attachment => {
            return this.attachmentRepository.create({
                fileName: attachment.fileName,
                fileSize: attachment.fileSize ? Number(attachment.fileSize) : 0,
                mimeType: attachment.fileType,
                filePath: attachment.fileUrl,
                publicUrl: attachment.fileUrl,
                isUploaded: true,
                message: message,
                messageId: message.id
            });
        });
    }

    /**
     * Create a new message
     */
    async create(data: CreateMessageDto & { organizationId: string; senderId: string }): Promise<Message> {
        return this.withTransaction(async (queryRunner) => {
            // Validate entities
            const [contact, sender] = await Promise.all([
                this.getValidContact(data.contactId, data.organizationId, data.type),
                this.getUser(data.senderId, 'Sender')
            ]);
    
            // Prepare message data using foreign keys instead of relation objects
            const messageData = {
                content: data.content,
                type: data.type,
                scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
                metadata: data.metadata,
                organizationId: data.organizationId,
                contactId: contact.id,  // Use foreign key instead of contact object
                senderId: sender.id,    // Use foreign key instead of sender object
                status: data.scheduledFor ? MessageStatus.SCHEDULED : MessageStatus.QUEUED,
                priority: data.priority,
                requireConfirmation: data.requireConfirmation || false,
                notes: data.notes,
                externalId: data.externalId,
                templateId: data.templateId,
                emailOptions: this.prepareEmailOptions(data)
            };
    
            // Create and save message
            const message = this.messageRepository.create(messageData);
            await this.applyTemplate(message, data.templateId, data.organizationId, contact);
            await queryRunner.manager.save(message);
    
            // Handle attachments
            const attachmentEntities = this.createAttachmentEntities(data.attachments, message);
            if (attachmentEntities.length > 0) {
                await queryRunner.manager.save(MessageAttachment, attachmentEntities);
            }
    
            // Emit event for immediate sending if not scheduled
            if (!data.scheduledFor) {
                this.eventEmitter.emit('message.created', message);
            }
    
            return message;
        });
    }

    /**
     * Find all messages with pagination and filtering
     */
    async findAll(query: MessageQueryDto & { organizationId: string }) {
        const { 
            organizationId, 
            type, 
            status, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 10 
        } = query;

        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .where('message.organizationId = :organizationId', { organizationId })
            .leftJoinAndSelect('message.contact', 'contact')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.attachments', 'attachments');

        if (type) {
            queryBuilder.andWhere('message.type = :type', { type });
        }

        if (status) {
            queryBuilder.andWhere('message.status = :status', { status });
        }

        if (startDate) {
            queryBuilder.andWhere('message.createdAt >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('message.createdAt <= :endDate', { endDate });
        }

        queryBuilder.orderBy('message.createdAt', 'DESC');

        return paginate(queryBuilder, { page, limit });
    }

    /**
     * Get conversations grouped by contact
     */
    async getConversations(query: MessageQueryDto & { organizationId: string }) {
        const { organizationId, page = 1, limit = 10 } = query;

        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .select('DISTINCT ON (message.contactId) message.*')
            .where('message.organizationId = :organizationId', { organizationId })
            .orderBy('message.contactId')
            .addOrderBy('message.createdAt', 'DESC');

        return paginate(queryBuilder, { page, limit });
    }

    /**
     * Get a single conversation with a contact
     */
    async getConversation(contactId: string, query: MessageQueryDto & { organizationId: string }) {
        const { organizationId, page = 1, limit = 20 } = query;

        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .where('message.organizationId = :organizationId', { organizationId })
            .andWhere('message.contactId = :contactId', { contactId })
            .leftJoinAndSelect('message.attachments', 'attachments')
            .orderBy('message.createdAt', 'DESC');

        return paginate(queryBuilder, { page, limit });
    }

    /**
     * Find a single message by ID
     */
    async findOne(id: string, organizationId: string): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: { id, organizationId },
            relations: ['contact', 'sender', 'attachments'],
        });

        if (!message) {
            throw new NotFoundException(`Message with ID ${id} not found`);
        }

        return message;
    }

    /**
     * Update a message
     */
    async update(
        id: string,
        data: UpdateMessageDto & { organizationId: string; updatedBy: string }
    ): Promise<Message> {
        const [message, user] = await Promise.all([
            this.findOne(id, data.organizationId),
            this.getUser(data.updatedBy, 'User')
        ]);

        if (message.status === MessageStatus.SENT || message.status === MessageStatus.DELIVERED) {
            throw new BadRequestException('Cannot update sent or delivered messages');
        }

        // Apply updates selectively
        if (data.subject && message.type === MessageType.EMAIL) {
            // Update email subject in emailOptions
            const emailOptions = message.emailOptions || { subject: 'No Subject' };
            emailOptions.subject = data.subject;
            message.emailOptions = emailOptions;
        }
        
        if (data.content) message.content = data.content;
        if (data.status) message.status = data.status;
        if (data.scheduledFor) message.scheduledFor = new Date(data.scheduledFor);
        if (data.metadata) message.metadata = data.metadata;
        if (data.notes) message.notes = data.notes;
        
        message.updatedById = data.updatedBy;
        
        return this.messageRepository.save(message);
    }

    /**
     * Remove a message (soft delete)
     */
    async remove(id: string, organizationId: string): Promise<void> {
        const message = await this.findOne(id, organizationId);
        await this.messageRepository.softRemove(message);
    }

    /**
     * Create a message template
     */
    async createTemplate(data: MessageTemplateDto & { organizationId: string; createdBy: string }) {
        const user = await this.getUser(data.createdBy, 'User');
        
        // Extract category from data
        const { category, ...restData } = data;
        
        // Create template with explicit fields
        const templateData = {
            name: data.name,
            description: data.description,
            type: data.type as any, // Force type casting for enum
            subject: data.subject || '',
            content: data.content,
            parameters: data.variables || {},
            isDefault: data.isDefault || false,
            isActive: true,
            organizationId: data.organizationId,
            createdById: data.createdBy,
            metadata: {}
        };
        
        // Create the template entity and handle possible array return
        const templateEntity = this.templateRepository.create(templateData as any);
        
        // Ensure we're working with a single entity
        const template = Array.isArray(templateEntity) ? templateEntity[0] : templateEntity;
        
        // Handle category if provided
        if (category) {
            if (typeof category === 'string') {
                // If it's a string, set it as reference entity
                template.category = { id: category } as any;
            } else if (category && typeof category === 'object') {
                // If it's an object, use it directly
                template.category = category as any;
            }
        }
        
        // Save and handle possible array return
        const result = await this.templateRepository.save(template);
        // Return the first item if it's an array, otherwise return the result directly
        return Array.isArray(result) ? result[0] : result;
    } 

    /**
     * Get all templates for an organization
     */
    async getTemplates(query: { organizationId: string }) {
        return this.templateRepository.find({
            where: { organizationId: query.organizationId },
            order: { name: 'ASC' },
        });
    }

    
    async sendBulk(data: BulkMessageDto & { organizationId: string; senderId: string }) {
        // Use transaction to ensure data consistency
        return this.withTransaction(async (queryRunner) => {
            // Find contacts
            const contacts = await this.contactRepository.find({
                where: { id: In(data.contactIds), organizationId: data.organizationId },
            });
        
            if (contacts.length !== data.contactIds.length) {
                throw new BadRequestException('Some contacts were not found');
            }
        
            // Ensure data.messageData exists
            if (!data.messageData) {
                throw new BadRequestException('Message data is required');
            }
        
            // Get sender
            const sender = await this.getUser(data.senderId, 'Sender');
        
            // Create messages for each contact with explicit fields
            const messagesData = contacts.map(contact => {
                return {
                    content: data.content || '',
                    subject: data.subject,
                    type: data.type as any,
                    scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
                    organizationId: data.organizationId,
                    contactId: contact.id,
                    senderId: data.senderId,
                    status: data.scheduledFor ? MessageStatus.SCHEDULED : MessageStatus.QUEUED,
                    templateId: data.templateId
                };
            });
        
            // Create and save message entities
            const messages = this.messageRepository.create(messagesData);
            const savedMessages = await queryRunner.manager.save(Message, messages);
        
            // Handle attachments separately if any
            if (data.attachments && data.attachments.length > 0) {
                const allAttachments: MessageAttachment[] = [];
                
                for (const message of savedMessages) {
                    data.attachments.forEach(attachment => {
                        const newAttachment = this.attachmentRepository.create({
                            fileName: attachment.filename,
                            fileSize: 0, // Default value as it's required
                            mimeType: attachment.contentType,
                            filePath: attachment.content,
                            publicUrl: attachment.content,
                            isUploaded: true,
                            message: message,
                            messageId: message.id
                        });
                        allAttachments.push(newAttachment);
                    });
                }
                
                if (allAttachments.length > 0) {
                    await queryRunner.manager.save(MessageAttachment, allAttachments);
                }
            }
        
            // Emit event for processing
            this.eventEmitter.emit('messages.bulk.created', savedMessages);
        
            return {
                success: true,
                count: savedMessages.length,
                messageIds: savedMessages.map(m => m.id),
            };
        });
    }
    
    /**
     * Get message statistics for an organization
     */
    async getStatistics(query: { organizationId: string; startDate?: Date; endDate?: Date }) {
        const { organizationId, startDate, endDate } = query;
    
        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .where('message.organizationId = :organizationId', { organizationId });
    
        if (startDate) {
            queryBuilder.andWhere('message.createdAt >= :startDate', { startDate });
        }
    
        if (endDate) {
            queryBuilder.andWhere('message.createdAt <= :endDate', { endDate });
        }
    
        const stats = await queryBuilder
            .select([
                'COUNT(*) as total',
                'COUNT(CASE WHEN status = :sent THEN 1 END) as sent',
                'COUNT(CASE WHEN status = :delivered THEN 1 END) as delivered',
                'COUNT(CASE WHEN status = :failed THEN 1 END) as failed',
                'COUNT(CASE WHEN readAt IS NOT NULL THEN 1 END) as read',
            ])
            .setParameter('sent', MessageStatus.SENT)
            .setParameter('delivered', MessageStatus.DELIVERED)
            .setParameter('failed', MessageStatus.FAILED)
            .getRawOne();
    
        return stats;
    }
    
    /**
     * Resend a failed message
     */
    async resend(id: string, context: { organizationId: string; userId: string }) {
        // Get message and user in parallel
        const [message, user] = await Promise.all([
            this.findOne(id, context.organizationId),
            this.getUser(context.userId, 'User')
        ]);
    
        if (message.status !== MessageStatus.FAILED) {
            throw new BadRequestException('Only failed messages can be resent');
        }
    
        // Update message
        
        // Ensure deliveryDetails exists before updating it
        const deliveryDetails = message.deliveryDetails || {};
        message.deliveryDetails = {
            provider: '',  // Default empty string
            attempts: 0,
            lastAttempt: undefined,
            errorCode: undefined,
            errorMessage: undefined,
            // Spread any existing properties AFTER defining defaults
            ...(message.deliveryDetails || {})
        };

        message.status = MessageStatus.QUEUED;
        // Fix: Wrap user in Promise
        message.updatedBy = this.asPromiseEntity(user);
    
        const savedMessage = await this.messageRepository.save(message);
    
        // Emit event for processing
        this.eventEmitter.emit('message.resend', savedMessage);
    
        return savedMessage;
    }
    
    /**
     * Mark a message as read
     */
    async markAsRead(id: string, context: { organizationId: string; userId: string }) {
        const message = await this.findOne(id, context.organizationId);
        
        if (!message.readAt) {
            message.readAt = new Date();
            await this.messageRepository.save(message);
        }
    
        return message;
    }
    
    /**
     * Process a message template
     */
    private processTemplate(template: string, contact: Contact): string {
        // Replace template variables with contact data
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            // Use type-safe property access
            const value = contact[key as keyof Contact];
            return value !== undefined && value !== null ? String(value) : match;
        });
    }
}