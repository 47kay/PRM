import { TicketsService } from '../services/tickets.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { UsersService } from '../../users/services/users.service';
export declare class TicketEscalationListener {
    private readonly ticketsService;
    private readonly notificationsService;
    private readonly usersService;
    constructor(ticketsService: TicketsService, notificationsService: NotificationsService, usersService: UsersService);
    handleSlaBreachEvent(payload: {
        ticketId: string;
        organizationId: string;
        slaType: 'response' | 'resolution';
        elapsedTime: number;
    }): Promise<void>;
    handleEscalationLevelChanged(payload: {
        ticketId: string;
        organizationId: string;
        previousLevel: number;
        newLevel: number;
    }): Promise<void>;
    private findAdmins;
    private formatElapsedTime;
}
