import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpStatus,
    ParseUUIDPipe,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { OrganizationGuard } from '../../../common/guards/organization.guard'; // Adjusted path
import { Roles } from '../../../common/decorators/roles.decorator'; // Adjusted path
import { Role } from '../../users/enums/role.enum';
import { TicketsService } from '../services/tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { CreateTicketCommentDto } from '../dto/ticket-comment.dto';
import { TicketAssignmentDto } from '../dto/ticket-assignment.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { OrganizationRequest } from '../../../interfaces/request.interface'; // Adjusted path

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard) // Added OrganizationGuard
@ApiBearerAuth()
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new ticket' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Ticket created successfully' })
    async create(
        @Body() createTicketDto: CreateTicketDto,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.create({
            ...createTicketDto,
            organizationId: req.organization.id,
            createdBy: req.user.id,
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get all tickets' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return all tickets' })
    async findAll(
        @Query() query: TicketQueryDto,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.findAll({
            ...query,
            organizationId: req.organization.id,
        });
    }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get tickets dashboard data' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return tickets dashboard data' })
    async getDashboard(
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.getDashboard(req.organization.id);
    }

    @Get('assigned')
    @ApiOperation({ summary: 'Get tickets assigned to current user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return assigned tickets' })
    async getAssignedTickets(
        @Query() query: TicketQueryDto,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.getAssignedTickets({
            ...query,
            organizationId: req.organization.id,
            userId: req.user.id,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get ticket by id' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return ticket details' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: OrganizationRequest,
    ) {
        const ticket = await this.ticketsService.findOne(id, req.organization.id);
        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }
        return ticket;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update ticket' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Ticket updated successfully' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTicketDto: UpdateTicketDto,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.update(id, {
            ...updateTicketDto,
            organizationId: req.organization.id,
            updatedBy: req.user.id,
        });
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete ticket' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Ticket deleted successfully' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: OrganizationRequest,
    ) {
        await this.ticketsService.remove(id, req.organization.id);
    }

    @Post(':id/comments')
    @ApiOperation({ summary: 'Add comment to ticket' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Comment added successfully' })
    async addComment(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() commentDto: CreateTicketCommentDto,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.addComment(id, {
            ...commentDto,
            organizationId: req.organization.id,
            userId: req.user.id,
        });
    }

    @Put(':id/assign')
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Assign ticket' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Ticket assigned successfully' })
    async assignTicket(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() assignmentDto: TicketAssignmentDto,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.assignTicket(id, {
            ...assignmentDto,
            organizationId: req.organization.id,
            assignedBy: req.user.id,
            ticketIds: [id],
        });
    }

    @Post(':id/escalate')
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Escalate ticket' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Ticket escalated successfully' })
    async escalateTicket(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('reason') reason: string,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.escalateTicket(id, {
            reason,
            organizationId: req.organization.id,
            escalatedBy: req.user.id,
        });
    }

    @Post(':id/resolve')
    @ApiOperation({ summary: 'Resolve ticket' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Ticket resolved successfully' })
    async resolveTicket(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('resolution') resolution: string,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.resolveTicket(id, {
            resolution,
            organizationId: req.organization.id,
            resolvedBy: req.user.id,
        });
    }

    @Post(':id/reopen')
    @ApiOperation({ summary: 'Reopen ticket' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Ticket reopened successfully' })
    async reopenTicket(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('reason') reason: string,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.reopenTicket(id, {
            reason,
            organizationId: req.organization.id,
            reopenedBy: req.user.id,
        });
    }


    @Get(':id/timeline')
    @ApiOperation({ summary: 'Get ticket timeline' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return ticket timeline' })
    async getTimeline(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.getTimeline(id, req.organization.id);
    }

    @Get(':id/related')
    @ApiOperation({ summary: 'Get related tickets' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return related tickets' })
    async getRelatedTickets(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: OrganizationRequest,
    ) {
        return this.ticketsService.getRelatedTickets(id, req.organization.id);
    }
}