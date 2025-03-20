import { Ticket } from './ticket.entity';
import { User } from '../../users/entities/user.entity';
import { TicketActivityType } from '../enums/ticket-activity-type.enum';
export declare class TicketActivity {
    id: string;
    organizationId: string;
    userId: string;
    action: string;
    details: any;
    ticketId: string;
    ticket: Ticket;
    performedById: string;
    performedBy: User;
    type: TicketActivityType;
    data: Record<string, any>;
    metadata?: Record<string, any>;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    changes?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    tags?: string[];
    parentActivityId?: string;
    parentActivity?: TicketActivity;
    context?: {
        location?: string;
        deviceInfo?: string;
        sessionId?: string;
        referrer?: string;
    };
    isSystem: boolean;
    isAutomated: boolean;
    requiresAttention: boolean;
    expiresAt?: Date;
    relatedEntities?: {
        entityType: string;
        entityId: string;
        relationship: string;
    }[];
    duration?: number;
    status?: string;
    importance: number;
    isHidden: boolean;
    customFields?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    processedAt?: Date;
    categories?: string[];
    validationResults?: {
        isValid: boolean;
        errors?: string[];
        warnings?: string[];
    };
    metrics?: {
        responseTime?: number;
        resourceUsage?: Record<string, number>;
        performance?: Record<string, number>;
    };
    securityContext?: {
        permissions?: string[];
        roles?: string[];
        accessLevel?: string;
        authenticationType?: string;
    };
    businessContext?: {
        department?: string;
        costCenter?: string;
        projectCode?: string;
        priority?: string;
    };
    audit?: {
        version: number;
        changedBy: string;
        changedAt: Date;
        reason?: string;
    };
}
