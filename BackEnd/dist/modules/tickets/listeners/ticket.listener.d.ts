import { Ticket } from '../entities/ticket.entity';
import { TicketActivityService } from '../services/ticket-activity.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
export declare class TicketListener {
    private readonly activityService;
    private readonly notificationsService;
    constructor(activityService: TicketActivityService, notificationsService: NotificationsService);
    handleTicketCreated(ticket: Ticket): Promise<void>;
    handleTicketEscalated(payload: {
        ticket: Ticket;
        reason: string;
    }): Promise<void>;
}
