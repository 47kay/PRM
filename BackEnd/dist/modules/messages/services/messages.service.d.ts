import { Repository, DataSource } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MessageTemplate } from '../entities/message-template.entity';
import { MessageAttachment } from '../entities/message-attachment.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MessageQueryDto } from '../dto/message-query.dto';
import { MessageTemplateDto } from '../dto/message-template.dto';
import { BulkMessageDto } from '../dto/bulk-message.dto';
import { Contact } from '../../contacts/entities/contact.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../users/entities/user.entity';
export declare class MessagesService {
    private readonly messageRepository;
    private readonly templateRepository;
    private readonly attachmentRepository;
    private readonly contactRepository;
    private readonly userRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    constructor(messageRepository: Repository<Message>, templateRepository: Repository<MessageTemplate>, attachmentRepository: Repository<MessageAttachment>, contactRepository: Repository<Contact>, userRepository: Repository<User>, dataSource: DataSource, eventEmitter: EventEmitter2);
    private asPromiseEntity;
    private withTransaction;
    private getValidContact;
    private getUser;
    private prepareEmailOptions;
    private applyTemplate;
    private createAttachmentEntities;
    create(data: CreateMessageDto & {
        organizationId: string;
        senderId: string;
    }): Promise<Message>;
    findAll(query: MessageQueryDto & {
        organizationId: string;
    }): Promise<import("nestjs-typeorm-paginate").Pagination<Message, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    getConversations(query: MessageQueryDto & {
        organizationId: string;
    }): Promise<import("nestjs-typeorm-paginate").Pagination<Message, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    getConversation(contactId: string, query: MessageQueryDto & {
        organizationId: string;
    }): Promise<import("nestjs-typeorm-paginate").Pagination<Message, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    findOne(id: string, organizationId: string): Promise<Message>;
    update(id: string, data: UpdateMessageDto & {
        organizationId: string;
        updatedBy: string;
    }): Promise<Message>;
    remove(id: string, organizationId: string): Promise<void>;
    createTemplate(data: MessageTemplateDto & {
        organizationId: string;
        createdBy: string;
    }): Promise<any>;
    getTemplates(query: {
        organizationId: string;
    }): Promise<MessageTemplate[]>;
    sendBulk(data: BulkMessageDto & {
        organizationId: string;
        senderId: string;
    }): Promise<{
        success: boolean;
        count: number;
        messageIds: string[];
    }>;
    getStatistics(query: {
        organizationId: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<any>;
    resend(id: string, context: {
        organizationId: string;
        userId: string;
    }): Promise<Message>;
    markAsRead(id: string, context: {
        organizationId: string;
        userId: string;
    }): Promise<Message>;
    private processTemplate;
}
