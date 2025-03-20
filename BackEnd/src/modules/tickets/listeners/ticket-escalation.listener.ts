// src/modules/tickets/listeners/ticket-escalation.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketsService } from '../services/tickets.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { UsersService } from '../../users/services/users.service';
import { Role } from '../../users/enums/role.enum';

@Injectable()
export class TicketEscalationListener {
    constructor(
        private readonly ticketsService: TicketsService,
        private readonly notificationsService: NotificationsService,
        private readonly usersService: UsersService,
    ) {}

    @OnEvent('ticket.sla.breach')
    async handleSlaBreachEvent(payload: {
        ticketId: string;
        organizationId: string;
        slaType: 'response' | 'resolution';
        elapsedTime: number;
    }) {
        const { ticketId, organizationId, slaType, elapsedTime } = payload;
        
        // Get ticket details
        const ticket = await this.ticketsService.findOne(ticketId, organizationId);
        
        // Find admins to notify
        const admins = await this.findAdmins(organizationId);
        
        if (admins.length === 0) {
            console.warn('No admins to notify for SLA breach');
            return;
        }
        
        // Create type message based on SLA type
        const typeMessage = slaType === 'response' 
            ? 'Response time SLA breached' 
            : 'Resolution time SLA breached';
        
        // Format elapsed time for human-readable display
        const formattedTime = this.formatElapsedTime(elapsedTime);
        
        // Notify each admin
        for (const admin of admins) {
            await this.notificationsService.create({
                type: 'SLA_BREACH',
                title: `${typeMessage} for Ticket #${ticket.referenceNumber}`,
                content: `${typeMessage} (${formattedTime}) for Ticket #${ticket.referenceNumber}`,
                priority: 'HIGH',
                recipients: [{ userId: admin.id }],
                organizationId: organizationId,
                senderId: 'system'
            });
        }
    }

    @OnEvent('ticket.escalation.levelchanged')
    async handleEscalationLevelChanged(payload: {
        ticketId: string;
        organizationId: string;
        previousLevel: number;
        newLevel: number;
    }) {
        const { ticketId, organizationId, previousLevel, newLevel } = payload;
        
        // Get ticket details
        const ticket = await this.ticketsService.findOne(ticketId, organizationId);
        
        // Find admins to notify
        const admins = await this.findAdmins(organizationId);
        
        if (admins.length === 0) {
            console.warn('No admins to notify for escalation level change');
            return;
        }
        
        // Notify each admin
        for (const admin of admins) {
            await this.notificationsService.create({
                type: 'ESCALATION_LEVEL_CHANGED',
                title: `Ticket #${ticket.referenceNumber} Escalation Level Changed`,
                content: `Ticket #${ticket.referenceNumber} escalation level changed from ${previousLevel} to ${newLevel}`,
                priority: 'MEDIUM',
                recipients: [{ userId: admin.id }],
                organizationId: organizationId,
                senderId: 'system'
            });
        }
    }
    
    // Helper method to find admins in the organization
    private async findAdmins(organizationId: string) {
        try {
            const result = await this.usersService.findAll({
                organizationId,
                role: Role.ADMIN,
                isActive: true,
                page: 1,
                limit: 50
            });
            
            return result.items;
        } catch (error) {
            console.error('Error finding admin users:', error);
            return [];
        }
    }
    
    // Helper method to format elapsed time
    private formatElapsedTime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}