import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Ticket } from '../entities/ticket.entity';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { OrganizationsService } from '../../organizations/services/organizations.service';
export declare class TicketEscalationService {
    private readonly ticketRepository;
    private readonly activityRepository;
    private readonly notificationsService;
    private readonly organizationsService;
    private readonly configService;
    private readonly logger;
    private readonly escalationRules;
    constructor(ticketRepository: Repository<Ticket>, activityRepository: Repository<TicketActivity>, notificationsService: NotificationsService, organizationsService: OrganizationsService, configService: ConfigService);
    checkTicketsForEscalation(): Promise<void>;
    private getCurrentEscalationLevel;
    private checkTicketEscalation;
    private escalateTicket;
    private notifyEscalation;
    private getOrganizationStaffByRoles;
    private getHoursElapsed;
    getTicketSlaStatus(ticketId: string): Promise<{
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
    }>;
    checkSlaBreachEscalation(ticketId: string): Promise<void>;
}
