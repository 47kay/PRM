import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, FindOperator, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Ticket } from '../entities/ticket.entity';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { TicketActivityType } from '../enums/ticket-activity-type.enum';
import { TicketStatus } from '../enums/ticket-status.enum';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { StaffMember } from '../../organizations/interfaces/staff-member.interface';

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
    // Using metadata to store escalation level instead of directly on Ticket entity
    const unresolved = await this.ticketRepository.find({
      where: {
        status: In([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
      },
      relations: ['assignee', 'organization', 'activities']
    });

    for (const ticket of unresolved) {
      // We'll check if the current escalation level is less than 3
      const currentLevel = this.getCurrentEscalationLevel(ticket);
      if (currentLevel < 3) {
        await this.checkTicketEscalation(ticket);
      }
    }
  }

  /**
   * Get the current escalation level from the ticket's metadata or activities
   */
  private getCurrentEscalationLevel(ticket: Ticket): number {
    // Try to find the most recent escalation activity
    const escalationActivities = ticket.activities?.filter(
      activity => activity.type === TicketActivityType.ESCALATION
    ) || [];
    
    if (escalationActivities.length > 0) {
      // Sort by created date, descending
      const latestEscalation = escalationActivities.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];
      
      // Get the escalation level from metadata
      return latestEscalation.metadata?.newLevel || 0;
    }
    
    return 0; // Default to no escalation
  }

  /**
   * Check single ticket for escalation
   */
  private async checkTicketEscalation(ticket: Ticket): Promise<void> {
    const rule = this.escalationRules[ticket.priority];
    if (!rule) return;

    const timeElapsed = this.getHoursElapsed(ticket.createdAt);
    const currentLevel = this.getCurrentEscalationLevel(ticket);
    
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
      // Instead of updating a non-existent escalation level field,
      // we'll track this in the activity metadata
      
      // Create activity log for the escalation
      // Create with only the fields that exist on TicketActivity
      const activityData = {
        ticket,
        type: TicketActivityType.ESCALATION,
        // Using metadata to store all the custom information
        metadata: {
          description: `Ticket escalated to level ${escalation.level}`,
          previousLevel: this.getCurrentEscalationLevel(ticket),
          newLevel: escalation.level,
          reason: 'SLA breach'
        }
      };
      
      const activity = this.activityRepository.create(activityData);
      
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
    try {
      // Get organization staff with required roles
      // Assuming organizationsService has a method to get staff by roles
      const staff = await this.getOrganizationStaffByRoles(
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
    } catch (error) {
      this.logger.error(`Failed to notify escalation for ticket ${ticket.id}:`, error);
    }
  }

  /**
   * Get organization staff by roles (implementation depends on your OrganizationsService)
   */
  private async getOrganizationStaffByRoles(organizationId: string, roles: string[]): Promise<StaffMember[]> {
    // Assuming the organization service has a method to get staff by org ID and roles
    // If not, this method needs to be implemented based on your application's structure
    try {
      // This is a fallback implementation if getStaffByRoles doesn't exist
      // Replace this with the actual implementation based on your OrganizationsService
      const organization = await this.organizationsService.findOne(organizationId);
      if (!organization) return [];
      
      // This is just a placeholder, implement based on your actual data model
      const staff = organization.staff || [];
      return staff.filter((member: StaffMember) => roles.includes(member.role));
    } catch (error) {
      this.logger.error(`Failed to get staff for organization ${organizationId}:`, error);
      return [];
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
    // Check for RESPONSE and RESOLUTION activity types
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
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['activities']
    });

    if (!ticket) return;

    if (slaStatus.responseTime.breached || slaStatus.resolutionTime.breached) {
      const rule = this.escalationRules[ticket.priority];
      const currentLevel = this.getCurrentEscalationLevel(ticket);

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