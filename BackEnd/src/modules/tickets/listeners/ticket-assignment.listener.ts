import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { UsersService } from '../../users/services/users.service';
import { TicketActivityType } from '../enums/ticket-activity-type.enum';
import { TicketStatus } from '../enums/ticket-status.enum';

interface TicketAssignmentEvent {
  ticketId: string;
  previousAssigneeId?: string;
  newAssigneeId?: string;
  assignedById: string;
}

@Injectable()
export class TicketAssignmentListener {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketActivity)
    private readonly activityRepository: Repository<TicketActivity>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  @OnEvent('ticket.assigned')
  async handleTicketAssigned(event: TicketAssignmentEvent) {
    // Create activity log
    await this.createAssignmentActivity(event);

    // Notify relevant users
    await this.sendAssignmentNotifications(event);
  }

  private async createAssignmentActivity(event: TicketAssignmentEvent): Promise<void> {
    const activity = this.activityRepository.create({
      ticketId: event.ticketId,
      type: TicketActivityType.ASSIGNED, // Fix #1: Changed from ASSIGNMENT to ASSIGNED
      metadata: {
        previousAssigneeId: event.previousAssigneeId,
        newAssigneeId: event.newAssigneeId,
        assignedById: event.assignedById
      }
    });

    await this.activityRepository.save(activity);
  }

  private async sendAssignmentNotifications(event: TicketAssignmentEvent): Promise<void> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: event.ticketId },
      relations: ['organization']
    });

    if (!ticket) return;

    // Notify new assignee
    if (event.newAssigneeId) {
      const newAssignee = await this.usersService.findById(event.newAssigneeId);
      
      if (newAssignee) {
        await this.notificationsService.send({
          userId: newAssignee.id,
          type: 'TICKET_ASSIGNED',
          title: `Ticket #${ticket.id} Assigned to You`,
          message: `You have been assigned to ticket: ${ticket.title}`,
          data: {
            ticketId: ticket.id,
            organizationId: ticket.organizationId
          }
        });
      }
    }

    // Notify previous assignee if exists
    if (event.previousAssigneeId) {
      const previousAssignee = await this.usersService.findById(event.previousAssigneeId);
      
      if (previousAssignee) {
        await this.notificationsService.send({
          userId: previousAssignee.id,
          type: 'TICKET_UNASSIGNED',
          title: `Ticket #${ticket.id} Reassigned`,
          message: `You have been unassigned from ticket: ${ticket.title}`,
          data: {
            ticketId: ticket.id,
            organizationId: ticket.organizationId
          }
        });
      }
    }
  }

  @OnEvent('ticket.auto_assignment.needed')
  async handleAutoAssignment(payload: {
    ticketId: string;
    organizationId: string;
    priority: string;
  }) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: payload.ticketId }
    });

    if (!ticket || ticket.assigneeId) return;

    // Implement auto-assignment logic here
    // This could include:
    // - Round-robin assignment
    // - Load-based assignment
    // - Skill-based routing
    // - Priority-based assignment
    
    // For example, find available agent with least number of high priority tickets
    const availableAgent = await this.findAvailableAgent(
      payload.organizationId,
      payload.priority
    );

    if (availableAgent) {
      await this.ticketRepository.update(payload.ticketId, {
        assigneeId: availableAgent.id
      });

      // Emit assignment event
      await this.handleTicketAssigned({
        ticketId: payload.ticketId,
        newAssigneeId: availableAgent.id,
        assignedById: 'SYSTEM'
      });
    }
  }

  private async findAvailableAgent(organizationId: string, priority: string) {
    // Fix #2: Implement this method since it doesn't exist in UsersService
    // This is a temporary implementation until UsersService has the proper method
    // You should eventually implement this method in UsersService
    
    // Find users with support role in this organization
    const supportAgents = await this.usersService.findByRole('SUPPORT', organizationId);
    
    if (!supportAgents || supportAgents.length === 0) {
      return null;
    }
    
    // Simple implementation: return the first available agent
    // In a real implementation, you'd want to consider workload, skills, etc.
    return supportAgents[0];
  }

  @OnEvent('user.availability.changed')
  async handleAgentAvailabilityChange(payload: {
    userId: string;
    isAvailable: boolean;
  }) {
    if (!payload.isAvailable) {
      // Reassign tickets if agent becomes unavailable
      const assignedTickets = await this.ticketRepository.find({
        where: {
          assigneeId: payload.userId,
          status: In(['OPEN', 'IN_PROGRESS'] as TicketStatus[]) // Fix #3: Using TypeORM's In operator with correct type casting
        }
      });

      for (const ticket of assignedTickets) {
        await this.handleAutoAssignment({
          ticketId: ticket.id,
          organizationId: ticket.organizationId,
          priority: ticket.priority
        });
      }
    }
  }
}