import { TicketsService } from '../services/tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { CreateTicketCommentDto } from '../dto/ticket-comment.dto';
import { TicketAssignmentDto } from '../dto/ticket-assignment.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { OrganizationRequest } from '../../../interfaces/request.interface';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto, req: OrganizationRequest): Promise<import("../entities/ticket.entity").Ticket>;
    findAll(query: TicketQueryDto, req: OrganizationRequest): Promise<import("nestjs-typeorm-paginate").Pagination<import("../entities/ticket.entity").Ticket, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    getDashboard(req: OrganizationRequest): Promise<any>;
    getAssignedTickets(query: TicketQueryDto, req: OrganizationRequest): Promise<import("nestjs-typeorm-paginate").Pagination<import("../entities/ticket.entity").Ticket, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    findOne(id: string, req: OrganizationRequest): Promise<import("../entities/ticket.entity").Ticket>;
    update(id: string, updateTicketDto: UpdateTicketDto, req: OrganizationRequest): Promise<import("../entities/ticket.entity").Ticket>;
    remove(id: string, req: OrganizationRequest): Promise<void>;
    addComment(id: string, commentDto: CreateTicketCommentDto, req: OrganizationRequest): Promise<import("../entities/ticket-comment.entity").TicketComment>;
    assignTicket(id: string, assignmentDto: TicketAssignmentDto, req: OrganizationRequest): Promise<import("../entities/ticket.entity").Ticket>;
    escalateTicket(id: string, reason: string, req: OrganizationRequest): Promise<import("../entities/ticket.entity").Ticket>;
    resolveTicket(id: string, resolution: string, req: OrganizationRequest): Promise<import("../entities/ticket.entity").Ticket>;
    reopenTicket(id: string, reason: string, req: OrganizationRequest): Promise<import("../entities/ticket.entity").Ticket>;
    getTimeline(id: string, req: OrganizationRequest): Promise<import("../entities/ticket-activity.entity").TicketActivity[]>;
    getRelatedTickets(id: string, req: OrganizationRequest): Promise<any>;
}
