
// src/modules/tickets/listeners/ticket.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Ticket } from '../entities/ticket.entity';
import { TicketActivityService } from '../services/ticket-activity.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationPriority, NotificationType } from '@/modules/notifications/dto/create-notification.dto';

@Injectable()
export class TicketListener {
    constructor(
        private readonly activityService: TicketActivityService,
        private readonly notificationsService: NotificationsService,
    ) {}

    @OnEvent('ticket.created')
    async handleTicketCreated(ticket: Ticket) {
        await this.activityService.recordActivity({
            ticketId: ticket.id,
            organizationId: ticket.organizationId,
            userId: ticket.createdById,
            action: 'CREATED',
            details: { status: ticket.status },
        });

        if (ticket.assigneeId) {
            await this.notificationsService.create({
                type: 'TICKET_ASSIGNED',
                title: 'New Ticket Assigned',
                content: `Ticket #${ticket.referenceNumber} has been assigned to you`,
                recipients: [{ userId: ticket.assigneeId }],
                organizationId: ticket.organizationId,
                senderId: ticket.createdById,
            });
        }
    }

    @OnEvent('ticket.escalated')
    async handleTicketEscalated(payload: { ticket: Ticket; reason: string }) {
        const { ticket, reason } = payload;

        await this.activityService.recordActivity({
            ticketId: ticket.id,
            organizationId: ticket.organizationId,
            userId: ticket.escalatedById,
            action: 'ESCALATED',
            details: { reason },
        });

        await this.notificationsService.create({
            type: NotificationType.TICKET_ESCALATED,
            title: 'Ticket Escalated',
            content: `Ticket #${ticket.referenceNumber} has been escalated: ${reason}`,
            priority: NotificationPriority.HIGH,
            recipients: [{ role: 'ADMIN' }],
            organizationId: ticket.organizationId,
            senderId: ticket.escalatedById,
        });
    }
}