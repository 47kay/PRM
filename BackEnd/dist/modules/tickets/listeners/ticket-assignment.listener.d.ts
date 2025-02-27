import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { UsersService } from '../../users/services/users.service';
interface TicketAssignmentEvent {
    ticketId: string;
    previousAssigneeId?: string;
    newAssigneeId?: string;
    assignedById: string;
}
export declare class TicketAssignmentListener {
    private readonly ticketRepository;
    private readonly activityRepository;
    private readonly notificationsService;
    private readonly usersService;
    constructor(ticketRepository: Repository<Ticket>, activityRepository: Repository<TicketActivity>, notificationsService: NotificationsService, usersService: UsersService);
    handleTicketAssigned(event: TicketAssignmentEvent): Promise<void>;
    private createAssignmentActivity;
    private sendAssignmentNotifications;
    handleAutoAssignment(payload: {
        ticketId: string;
        organizationId: string;
        priority: string;
    }): Promise<void>;
    private findAvailableAgent;
    handleAgentAvailabilityChange(payload: {
        userId: string;
        isAvailable: boolean;
    }): Promise<void>;
}
export {};
