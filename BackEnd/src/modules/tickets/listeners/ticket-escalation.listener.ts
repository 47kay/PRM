import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketEscalationService } from '../services/ticket-escalation.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { TicketActivityType } from '../enums/ticket-activity-type.enum';

interface TicketActivityEvent {
  ticketId: string;
  type: TicketActivityType;
  metadata?: Record<string, any>;
}

@Injectable()
export class TicketEscalationListener {
  constructor(
    private readonly escalationService: TicketEscalationService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('ticket.activity.created')
  async handleTicketActivity(event: TicketActivityEvent) {
    // Check SLA status after any activity
    await this.escalationService.checkSlaBreachEscalation(event.ticketId);
  }

  @OnEvent('ticket.updated')
  async handleTicketUpdate(payload: { 
    ticketId: string;
    changes: Record<string, any>;
  }) {
    // Check for priority changes that might affect SLA
    if (payload.changes.priority) {
      await this.escalationService.checkSlaBreachEscalation(payload.ticketId);
    }
  }

  @OnEvent('ticket.sla.breached')
  async handleSlaBreached(payload: {
    ticketId: string;
    slaType: 'response' | 'resolution';
    elapsedTime: number;
  }) {
    // Handle SLA breach notifications
    await this.notificationsService.send({
      type: 'TICKET_SLA_BREACH',
      title: `SLA Breached for Ticket #${payload.ticketId}`,
      message: `${payload.slaType.toUpperCase()} SLA has been breached. Elapsed time: ${payload.elapsedTime} hours`,
      data: {
        ticketId: payload.ticketId,
        slaType: payload.slaType,
        elapsedTime: payload.elapsedTime
      }
    });
  }

  @OnEvent('ticket.escalated')
  async handleTicketEscalated(payload: {
    ticketId: string;
    previousLevel: number;
    newLevel: number;
  }) {
    // Handle escalation level change notifications
    await this.notificationsService.send({
      type: 'TICKET_ESCALATED',
      title: `Ticket #${payload.ticketId} Escalated`,
      message: `Ticket has been escalated from level ${payload.previousLevel} to level ${payload.newLevel}`,
      data: {
        ticketId: payload.ticketId,
        previousLevel: payload.previousLevel,
        newLevel: payload.newLevel
      }
    });
  }

  @OnEvent('cron.hourly')
  async handleHourlyCheck() {
    // Periodic check for tickets that need escalation
    await this.escalationService.checkTicketsForEscalation();
  }
}