// src/modules/messages/services/messages.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Not, IsNull, SaveOptions } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MessageTemplate } from '../entities/message-template.entity';
// import { TemplateCategory } from '../entities/template-category.entity';
import { MessageAttachment } from '../entities/message-attachment.entity';
import { CreateMessageDto, MessageType, MessageStatus } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MessageQueryDto } from '../dto/message-query.dto';
import { MessageTemplateDto } from '../dto/message-template.dto';
import { BulkMessageDto } from '../dto/bulk-message.dto';
import { Contact } from '../../contacts/entities/contact.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { paginate } from 'nestjs-typeorm-paginate';
import { DeepPartial } from 'typeorm';
import { TemplateCategory } from '../entities/template-category.entity';


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
        private readonly dataSource: DataSource,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async create(data: CreateMessageDto & { organizationId: string; senderId: string }): Promise<Message> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate contact
            const contact = await this.contactRepository.findOne({
                where: { id: data.contactId, organizationId: data.organizationId },
            });

            if (!contact) {
                throw new NotFoundException('Contact not found');
            }

            // Check contact preferences and validate communication channel
            if (data.type === MessageType.EMAIL && !contact.email) {
                throw new BadRequestException('Contact has no email address');
            }
            if (data.type === MessageType.SMS && !contact.phoneNumber) {
                throw new BadRequestException('Contact has no phone number');
            }

            // Create message
            const message = this.messageRepository.create({
                ...data,
                status: data.scheduledFor ? MessageStatus.QUEUED : MessageStatus.SENDING,
                attachments: data.attachments as DeepPartial<MessageAttachment>[],
            });

            // Handle template if provided
            if (data.templateId) {
                const template = await this.templateRepository.findOne({
                    where: { id: data.templateId, organizationId: data.organizationId },
                });
                if (!template) {
                    throw new NotFoundException('Template not found');
                }
                message.content = this.processTemplate(template.content, contact);
            }

            // Save message
            await queryRunner.manager.save(Message, message);

            // Handle attachments if any
            if (data.attachments && data.attachments.length > 0) {
                const attachmentEntities = data.attachments.map(attachment => {
                    return this.attachmentRepository.create({
                        ...attachment,
                        message: message, // Use the relation object instead of messageId
                        fileSize: attachment.fileSize ? Number(attachment.fileSize) : undefined, // Ensure fileSize is a number
                        // Don't include organizationId if it's not in the entity
                    });
                });
                await queryRunner.manager.save(MessageAttachment, attachmentEntities);
            }

            await queryRunner.commitTransaction();

            // Emit event for immediate sending if not scheduled
            if (!data.scheduledFor) {
                this.eventEmitter.emit('message.created', message);
            }

            return message;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

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

    async findOne(id: string, organizationId: string): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: { id, organizationId },
            relations: ['contact', 'sender', 'attachments'],
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        return message;
    }

    async update(
        id: string,
        data: UpdateMessageDto & { organizationId: string; updatedBy: string }
    ): Promise<Message> {
        const message = await this.findOne(id, data.organizationId);

        if (message.status === MessageStatus.SENT || message.status === MessageStatus.DELIVERED) {
            throw new BadRequestException('Cannot update sent or delivered messages');
        }

        Object.assign(message, data);
        return this.messageRepository.save(message);
    }

    async remove(id: string, organizationId: string): Promise<void> {
        const message = await this.findOne(id, organizationId);
        await this.messageRepository.softRemove(message);
    }

    async createTemplate(data: MessageTemplateDto & { organizationId: string; createdBy: string }) {
        // Fix for error on line 214
        // Create template data without category first
        const { category, ...restData } = data;
        
        // Create template entity
        const template = this.templateRepository.create(restData as unknown as DeepPartial<MessageTemplate>);
        
        // Set category relationship if provided
        if (category) {
            if (typeof category === 'string') {
                // If we have a category ID, create a reference entity
                template.category = { id: category } as any;
            } else {
                // If we have a category object, assign it directly
                template.category = category as any;
            }
        }
        
        return this.templateRepository.save(template);
    }

    async getTemplates(query: { organizationId: string }) {
        return this.templateRepository.find({
            where: { organizationId: query.organizationId },
            order: { name: 'ASC' },
        });
    }

    async sendBulk(data: BulkMessageDto & { organizationId: string; senderId: string }) {
        const contacts = await this.contactRepository.find({
            where: { 
                id: In(data.contactIds),
                organizationId: data.organizationId,
            },
        });

        if (contacts.length !== data.contactIds.length) {
            throw new BadRequestException('Some contacts were not found');
        }

        // Ensure data.messageData exists and is properly typed
        if (!data.messageData) {
            throw new BadRequestException('Message data is required');
        }

        // Create messages for each contact
        const messages = contacts.map(contact =>
            this.messageRepository.create({
                ...data.messageData,
                contactId: contact.id,
                organizationId: data.organizationId,
                senderId: data.senderId,
                attachments: data.messageData.attachments as DeepPartial<MessageAttachment>[],
            })
        );

        // Save all messages
        const savedMessages = await this.messageRepository.save(messages.flat());

        // Emit event for processing
        this.eventEmitter.emit('messages.bulk.created', savedMessages);

        return {
            success: true,
            count: savedMessages.length,
            messageIds: savedMessages.map(m => m.id),
        };
    }

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

    async resend(id: string, context: { organizationId: string; userId: string }) {
        const message = await this.findOne(id, context.organizationId);

        if (message.status !== MessageStatus.FAILED) {
            throw new BadRequestException('Only failed messages can be resent');
        }

        message.status = MessageStatus.QUEUED;
        message.updatedById = context.userId;
        
        // Ensure deliveryDetails exists before updating it
        const deliveryDetails: { provider?: string; attempts?: number; lastAttempt?: Date; errorCode?: string; errorMessage?: string } = message.deliveryDetails || {};
        message.deliveryDetails = {
            ...deliveryDetails,
            provider: deliveryDetails.provider || '', // Add provider with a default value
            attempts: 0,
            lastAttempt: undefined, // Use undefined instead of null for Date
            errorCode: undefined,   // Use undefined instead of null for string
            errorMessage: undefined // Use undefined instead of null for string
        };

        await this.messageRepository.save(message);

        // Emit event for processing
        this.eventEmitter.emit('message.resend', message);

        return message;
    }

    async markAsRead(id: string, context: { organizationId: string; userId: string }) {
        const message = await this.findOne(id, context.organizationId);
        
        if (!message.readAt) {
            message.readAt = new Date();
            await this.messageRepository.save(message);
        }

        return message;
    }

    private processTemplate(template: string, contact: Contact): string {
        // Replace template variables with contact data
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            // Use type-safe property access
            const value = contact[key as keyof Contact];
            return value !== undefined && value !== null ? String(value) : match;
        });
    }
}