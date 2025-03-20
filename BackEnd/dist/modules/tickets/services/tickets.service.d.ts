import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Ticket } from '../entities/ticket.entity';
import { TicketComment } from '../entities/ticket-comment.entity';
import { TicketAttachment } from '../entities/ticket-attachment.entity';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { CreateTicketCommentDto } from '../dto/ticket-comment.dto';
import { BulkTicketAssignmentDto } from '../dto/ticket-assignment.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { User } from '../../users/entities/user.entity';
export declare class TicketsService {
    private readonly ticketRepository;
    private readonly commentRepository;
    private readonly attachmentRepository;
    private readonly activityRepository;
    private readonly dataSource;
    private readonly userRepository;
    private readonly eventEmitter;
    private readonly notificationsService;
    constructor(ticketRepository: Repository<Ticket>, commentRepository: Repository<TicketComment>, attachmentRepository: Repository<TicketAttachment>, activityRepository: Repository<TicketActivity>, dataSource: DataSource, userRepository: Repository<User>, eventEmitter: EventEmitter2, notificationsService: NotificationsService);
    getRelatedTickets(ticketId: string, organizationId: string): Promise<any>;
    remove(id: string, organizationId: string): Promise<void>;
    reopenTicket(id: string, reopenDetails: {
        reason: string;
        organizationId: string;
        reopenedBy: string;
    }): Promise<Ticket>;
    create(data: CreateTicketDto & {
        organizationId: string;
        createdBy: string;
    }): Promise<Ticket>;
    findAll(query: TicketQueryDto & {
        organizationId: string;
    }): Promise<import("nestjs-typeorm-paginate").Pagination<Ticket, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    findOne(id: string, organizationId: string): Promise<Ticket>;
    update(id: string, data: UpdateTicketDto & {
        organizationId: string;
        updatedBy: string;
    }): Promise<Ticket>;
    assignTicket(id: string, data: BulkTicketAssignmentDto & {
        organizationId: string;
        assignedBy: string;
    }): Promise<Ticket>;
    addComment(id: string, data: CreateTicketCommentDto & {
        organizationId: string;
        userId: string;
    }): Promise<TicketComment>;
    escalateTicket(id: string, data: {
        reason: string;
        organizationId: string;
        escalatedBy: string;
    }): Promise<Ticket>;
    resolveTicket(id: string, data: {
        resolution: string;
        organizationId: string;
        resolvedBy: string;
    }): Promise<Ticket>;
    getAssignedTickets(query: TicketQueryDto & {
        organizationId: string;
        userId: string;
    }): Promise<import("nestjs-typeorm-paginate").Pagination<Ticket, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    getTimeline(id: string, organizationId: string): Promise<TicketActivity[]>;
    getDashboard(organizationId: string): Promise<any>;
}
