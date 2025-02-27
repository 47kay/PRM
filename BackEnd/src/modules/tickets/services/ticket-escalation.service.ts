import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Ticket } from '../entities/ticket.entity';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { TicketActivityType } from '../enums/ticket-activity-type.enum';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { OrganizationsService } from '../../organizations/services/organizations.service';

interface EscalationRule {
  priority: string;
  responseTime: number; // in hours
  resolutionTime: number; // in hours
  escalationLevels: {
    level: number;
    timeThreshold: number; // in hours
    notifyRoles: string[];
  }[];
}

@Injectable()
export class TicketEscalationService {
  private readonly logger = new Logger(TicketEscalationService.name);
  private readonly escalationRules: Record<string, EscalationRule>;

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketActivity)
    private readonly activityRepository: Repository<TicketActivity>,
    private readonly notificationsService: NotificationsService,
    private readonly organizationsService: OrganizationsService,
    private readonly configService: ConfigService,
  ) {
    // Initialize escalation rules from config
    this.escalationRules = {
      HIGH: {
        priority: 'HIGH',
        responseTime: 1, // 1 hour
        resolutionTime: 4, // 4 hours
        escalationLevels: [
          {
            level: 1,
            timeThreshold: 1,
            notifyRoles: ['SUPERVISOR']
          },
          {
            level: 2,
            timeThreshold: 2,
            notifyRoles: ['MANAGER']
          },
          {
            level: 3,
            timeThreshold: 4,
            notifyRoles: ['DIRECTOR']
          }
        ]
      },
      MEDIUM: {
        priority: 'MEDIUM',
        responseTime: 4, // 4 hours
        resolutionTime: 24, // 24 hours
        escalationLevels: [
          {
            level: 1,
            timeThreshold: 4,
            notifyRoles: ['SUPERVISOR']
          },
          {
            level: 2,
            timeThreshold: 8,
            notifyRoles: ['MANAGER']
          }
        ]
      },
      LOW: {
        priority: 'LOW',
        responseTime: 24, // 24 hours
        resolutionTime: 72, // 72 hours
        escalationLevels: [
          {
            level: 1,
            timeThreshold: 24,
            notifyRoles: ['SUPERVISOR']
          }
        ]
      }
    };
  }

  /**
   * Check tickets for escalation
   */
  async checkTicketsForEscalation(): Promise<void> {
    const unresolved = await this.ticketRepository.find({
      where: {
        status: ['OPEN', 'IN_PROGRESS'],
        escalationLevel: LessThan(3) // Max escalation level
      },
      relations: ['assignee', 'organization']
    });

    for (const ticket of unresolved) {
      await this.checkTicketEscalation(ticket);
    }
  }

  /**
   * Check single ticket for escalation
   */
  private async checkTicketEscalation(ticket: Ticket): Promise<void> {
    const rule = this.escalationRules[ticket.priority];
    if (!rule) return;

    const timeElapsed = this.getHoursElapsed(ticket.createdAt);
    const currentLevel = ticket.escalationLevel || 0;
    
    // Find next escalation level
    const nextEscalation = rule.escalationLevels.find(level => 
      level.level === currentLevel + 1 && timeElapsed >= level.timeThreshold
    );

    if (nextEscalation) {
      await this.escalateTicket(ticket, nextEscalation);
    }
  }

  /**
   * Escalate a ticket to the next level
   */
  private async escalateTicket(ticket: Ticket, escalation: EscalationRule['escalationLevels'][0]): Promise<void> {
    try {
      // Update ticket escalation level
      await this.ticketRepository.update(ticket.id, {
        escalationLevel: escalation.level
      });

      // Create activity log
      const activity = this.activityRepository.create({
        ticket,
        type: TicketActivityType.ESCALATION,
        description: `Ticket escalated to level ${escalation.level}`,
        metadata: {
          previousLevel: ticket.escalationLevel,
          newLevel: escalation.level,
          reason: 'SLA breach'
        }
      });
      await this.activityRepository.save(activity);

      // Notify relevant staff
      await this.notifyEscalation(ticket, escalation);

    } catch (error) {
      this.logger.error(`Failed to escalate ticket ${ticket.id}:`, error);
    }
  }

  /**
   * Send escalation notifications
   */
  private async notifyEscalation(ticket: Ticket, escalation: EscalationRule['escalationLevels'][0]): Promise<void> {
    // Get organization staff with required roles
    const staff = await this.organizationsService.getStaffByRoles(
      ticket.organizationId,
      escalation.notifyRoles
    );

    // Send notifications
    for (const user of staff) {
      await this.notificationsService.send({
        userId: user.id,
        type: 'TICKET_ESCALATION',
        title: `Ticket #${ticket.id} Escalated`,
        message: `Ticket has been escalated to level ${escalation.level}`,
        data: {
          ticketId: ticket.id,
          escalationLevel: escalation.level,
          priority: ticket.priority
        }
      });
    }
  }

  /**
   * Calculate hours elapsed since a given date
   */
  private getHoursElapsed(date: Date): number {
    const elapsed = Date.now() - date.getTime();
    return elapsed / (1000 * 60 * 60);
  }

  /**
   * Get SLA status for a ticket
   */
  async getTicketSlaStatus(ticketId: string): Promise<{
    responseTime: {
      target: number;
      actual: number | null;
      breached: boolean;
    };
    resolutionTime: {
      target: number;
      actual: number | null;
      breached: boolean;
    };
  }> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['activities']
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const rule = this.escalationRules[ticket.priority];
    const firstResponse = ticket.activities.find(
      a => a.type === TicketActivityType.RESPONSE
    );
    const resolution = ticket.activities.find(
      a => a.type === TicketActivityType.RESOLUTION
    );

    return {
      responseTime: {
        target: rule.responseTime,
        actual: firstResponse ? 
          this.getHoursElapsed(ticket.createdAt) : null,
        breached: !firstResponse && 
          this.getHoursElapsed(ticket.createdAt) > rule.responseTime
      },
      resolutionTime: {
        target: rule.resolutionTime,
        actual: resolution ?
          this.getHoursElapsed(ticket.createdAt) : null,
        breached: !resolution &&
          this.getHoursElapsed(ticket.createdAt) > rule.resolutionTime
      }
    };
  }

  /**
   * Check if ticket needs auto-escalation due to SLA breach
   */
  async checkSlaBreachEscalation(ticketId: string): Promise<void> {
    const slaStatus = await this.getTicketSlaStatus(ticketId);
    const ticket = await this.ticketRepository.findOneBy({ id: ticketId });

    if (!ticket) return;

    if (slaStatus.responseTime.breached || slaStatus.resolutionTime.breached) {
      const rule = this.escalationRules[ticket.priority];
      const currentLevel = ticket.escalationLevel || 0;

      // Find appropriate escalation level based on breach severity
      const nextLevel = rule.escalationLevels.find(level => 
        level.level === currentLevel + 1
      );

      if (nextLevel) {
        await this.escalateTicket(ticket, nextLevel);
      }
    }
  }
}