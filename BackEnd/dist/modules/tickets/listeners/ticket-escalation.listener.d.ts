import { TicketEscalationService } from '../services/ticket-escalation.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { TicketActivityType } from '../enums/ticket-activity-type.enum';
interface TicketActivityEvent {
    ticketId: string;
    type: TicketActivityType;
    metadata?: Record<string, any>;
}
export declare class TicketEscalationListener {
    private readonly escalationService;
    private readonly notificationsService;
    constructor(escalationService: TicketEscalationService, notificationsService: NotificationsService);
    handleTicketActivity(event: TicketActivityEvent): Promise<void>;
    handleTicketUpdate(payload: {
        ticketId: string;
        changes: Record<string, any>;
    }): Promise<void>;
    handleSlaBreached(payload: {
        ticketId: string;
        slaType: 'response' | 'resolution';
        elapsedTime: number;
    }): Promise<void>;
    handleTicketEscalated(payload: {
        ticketId: string;
        previousLevel: number;
        newLevel: number;
    }): Promise<void>;
    handleHourlyCheck(): Promise<void>;
}
export {};
