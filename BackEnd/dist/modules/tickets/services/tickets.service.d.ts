import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Ticket } from '../entities/ticket.entity';
import { TicketComment } from '../entities/ticket-comment.entity';
import { TicketAttachment } from '../entities/ticket-attachment.entity';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketCommentDto } from '../dto/ticket-comment.dto';
import { TicketAssignmentDto } from '../dto/ticket-assignment.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';
export declare class TicketsService {
    private readonly ticketRepository;
    private readonly commentRepository;
    private readonly attachmentRepository;
    private readonly activityRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly notificationsService;
    constructor(ticketRepository: Repository<Ticket>, commentRepository: Repository<TicketComment>, attachmentRepository: Repository<TicketAttachment>, activityRepository: Repository<TicketActivity>, dataSource: DataSource, eventEmitter: EventEmitter2, notificationsService: NotificationsService);
    create(data: CreateTicketDto & {
        organizationId: string;
        createdBy: string;
    }): Promise<Ticket>;
    findAll(query: TicketQueryDto & {
        organizationId: string;
    }): Promise<import("nestjs-typeorm-paginate").Pagination<unknown, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    findOne(id: string, organizationId: string): Promise<Ticket>;
    update(id: string, data: UpdateTicketDto & {
        organizationId: string;
        updatedBy: string;
    }): Promise<Ticket>;
    assignTicket(id: string, data: TicketAssignmentDto & {
        organizationId: string;
        assignedBy: string;
    }): Promise<Ticket>;
    addComment(id: string, data: TicketCommentDto & {
        organizationId: string;
        userId: string;
    }): Promise<TicketComment>;
    escalateTicket(id: string, data: {
        reason: string;
        organizationId: string;
        escalatedBy: string;
    }): Promise<Ticket>;
    getTimeline(id: string, organizationId: string): Promise<TicketActivity[]>;
    getDashboard(organizationId: string): Promise<any>;
}
