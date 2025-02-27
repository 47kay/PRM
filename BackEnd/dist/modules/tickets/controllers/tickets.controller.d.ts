import { TicketsService } from '../services/tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketCommentDto } from '../dto/ticket-comment.dto';
import { TicketAssignmentDto } from '../dto/ticket-assignment.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { CustomRequest } from '../../../interfaces/request.interface';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto, req: CustomRequest): Promise<import("../entities/ticket.entity").Ticket>;
    findAll(query: TicketQueryDto, req: CustomRequest): Promise<import("nestjs-typeorm-paginate").Pagination<unknown, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    getDashboard(req: CustomRequest): Promise<any>;
    getAssignedTickets(query: TicketQueryDto, req: CustomRequest): Promise<any>;
    findOne(id: string, req: CustomRequest): Promise<import("../entities/ticket.entity").Ticket>;
    update(id: string, updateTicketDto: UpdateTicketDto, req: CustomRequest): Promise<import("../entities/ticket.entity").Ticket>;
    remove(id: string, req: CustomRequest): Promise<void>;
    addComment(id: string, commentDto: TicketCommentDto, req: CustomRequest): Promise<import("../entities/ticket-comment.entity").TicketComment>;
    assignTicket(id: string, assignmentDto: TicketAssignmentDto, req: CustomRequest): Promise<import("../entities/ticket.entity").Ticket>;
    escalateTicket(id: string, reason: string, req: CustomRequest): Promise<import("../entities/ticket.entity").Ticket>;
    resolveTicket(id: string, resolution: string, req: CustomRequest): Promise<any>;
    reopenTicket(id: string, reason: string, req: CustomRequest): Promise<any>;
    getTimeline(id: string, req: CustomRequest): Promise<import("../entities/ticket-activity.entity").TicketActivity[]>;
    getRelatedTickets(id: string, req: CustomRequest): Promise<any>;
}
