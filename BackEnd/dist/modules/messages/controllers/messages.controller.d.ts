import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MessageQueryDto } from '../dto/message-query.dto';
import { Message } from '../entities/message.entity';
import { CustomRequest } from '../../../interfaces/request.interface';
import { MessageTemplateDto } from '../dto/message-template.dto';
import { BulkMessageDto } from '../dto/bulk-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(createMessageDto: CreateMessageDto, req: CustomRequest): Promise<Message>;
    findAll(query: MessageQueryDto, req: CustomRequest): Promise<import("nestjs-typeorm-paginate").Pagination<Message, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    getConversations(query: MessageQueryDto, req: CustomRequest): Promise<import("nestjs-typeorm-paginate").Pagination<Message, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    getConversation(contactId: string, query: MessageQueryDto, req: CustomRequest): Promise<import("nestjs-typeorm-paginate").Pagination<Message, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    findOne(id: string, req: CustomRequest): Promise<Message>;
    update(id: string, updateMessageDto: UpdateMessageDto, req: CustomRequest): Promise<Message>;
    remove(id: string, req: CustomRequest): Promise<void>;
    createTemplate(templateDto: MessageTemplateDto, req: CustomRequest): Promise<any>;
    getTemplates(query: MessageQueryDto, req: CustomRequest): Promise<import("../entities/message-template.entity").MessageTemplate[]>;
    sendBulk(bulkMessageDto: BulkMessageDto, req: CustomRequest): Promise<{
        success: boolean;
        count: number;
        messageIds: string[];
    }>;
    getStatistics(query: MessageQueryDto, req: CustomRequest): Promise<any>;
    resend(id: string, req: CustomRequest): Promise<Message>;
    markAsRead(id: string, req: CustomRequest): Promise<Message>;
}
