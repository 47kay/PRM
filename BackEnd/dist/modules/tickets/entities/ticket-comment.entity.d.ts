import { Ticket } from './ticket.entity';
import { User } from '../../users/entities/user.entity';
import { TicketAttachment } from './ticket-attachment.entity';
export declare class TicketComment {
    id: string;
    organizationId: string;
    userId: string;
    content: string;
    isInternal: boolean;
    ticketId: string;
    ticket: Ticket;
    authorId: string;
    author: User;
    attachments: TicketAttachment[];
    parentId: string;
    parent: TicketComment;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    editedAt: Date;
    editedBy: string;
}
