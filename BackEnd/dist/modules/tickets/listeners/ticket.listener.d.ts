import { Ticket } from '../entities/ticket.entity';
import { TicketActivityService } from '../services/ticket-activity.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { UsersService } from '../../users/services/users.service';
export declare class TicketListener {
    private readonly activityService;
    private readonly notificationsService;
    private readonly usersService;
    constructor(activityService: TicketActivityService, notificationsService: NotificationsService, usersService: UsersService);
    handleTicketCreated(ticket: Ticket): Promise<void>;
    handleTicketEscalated(payload: {
        ticket: Ticket;
        reason: string;
    }): Promise<void>;
    private findAdminUsers;
}
