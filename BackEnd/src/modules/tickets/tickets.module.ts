// src/modules/tickets/tickets.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { TicketsController } from './controllers/tickets.controller';
import { TicketsService } from './services/tickets.service';
import { TicketActivityService } from './services/ticket-activity.service';
import { TicketEscalationService } from './services/ticket-escalation.service';

import { Ticket } from './entities/ticket.entity';
import { TicketComment } from './entities/ticket-comment.entity';
import { TicketAttachment } from './entities/ticket-attachment.entity';
import { TicketActivity } from './entities/ticket-activity.entity';

import { TicketListener } from './listeners/ticket.listener';
import { TicketEscalationListener } from './listeners/ticket-escalation.listener';
import { TicketAssignmentListener } from './listeners/ticket-assignment.listener';

import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { ContactsModule } from '../contacts/contacts.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { DepartmentsModule } from '../departments/departments.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Ticket,
            TicketComment,
            TicketAttachment,
            TicketActivity
        ]),
        EventEmitterModule.forRoot({
            // Enable wildcard event listeners
            wildcard: true,
            // Remove memory-leak warnings
            maxListeners: 20,
            // Enable verbose error handling
            verboseMemoryLeak: true,
        }),
        NotificationsModule,
        UsersModule,
        ContactsModule,
        OrganizationsModule,
        DepartmentsModule,
        AuthModule
    ],
    controllers: [TicketsController],
    providers: [
        // Core services
        TicketsService,
        TicketActivityService,
        TicketEscalationService,

        // Event listeners
        TicketListener,
        TicketEscalationListener,
        TicketAssignmentListener,
    ],
    exports: [TicketsService]
})
export class TicketsModule {}