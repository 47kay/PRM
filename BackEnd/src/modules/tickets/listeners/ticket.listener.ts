// src/modules/tickets/listeners/ticket.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Ticket } from '../entities/ticket.entity';
import { TicketActivityService } from '../services/ticket-activity.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationPriority, NotificationType } from '@/modules/notifications/dto/create-notification.dto';
import { UsersService } from '../../users/services/users.service';
import { Role } from '../../users/enums/role.enum';

interface AdminUser {
  id: string;
}

@Injectable()
export class TicketListener {
    constructor(
        private readonly activityService: TicketActivityService,
        private readonly notificationsService: NotificationsService,
        private readonly usersService: UsersService,
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

        // For the activity, just record the status without the reason
        await this.activityService.recordActivity({
            ticketId: ticket.id,
            organizationId: ticket.organizationId,
            userId: ticket.escalatedById || '',
            action: 'ESCALATED',
            details: { status: ticket.status },
        });
        
        // Find admin users based on their role
        const adminUsers = await this.findAdminUsers(ticket.organizationId);
        
        // Only proceed if we found admin users
        if (adminUsers.length > 0) {
            await this.notificationsService.create({
                type: NotificationType.TICKET_ESCALATED,
                title: 'Ticket Escalated',
                content: `Ticket #${ticket.referenceNumber} has been escalated: ${reason}`,
                priority: NotificationPriority.HIGH,
                // Use explicit typing for admin parameter
                recipients: adminUsers.map((admin: AdminUser) => ({ userId: admin.id })),
                organizationId: ticket.organizationId,
                senderId: ticket.escalatedById || '',
            });
        }
    }
    
    // Helper method to find admin users using the UsersService
    private async findAdminUsers(organizationId: string): Promise<AdminUser[]> {
        try {
            // Use the findAll method with appropriate query parameters
            const result = await this.usersService.findAll({
                organizationId,
                role: Role.ADMIN,
                isActive: true,
                page: 1,
                limit: 50
            });
            
            // Map the paginated result items to the AdminUser interface
            return result.items.map(user => ({ id: user.id }));
        } catch (error) {
            console.error('Error finding admin users:', error);
            return [];
        }
    }
}