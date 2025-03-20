import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { Ticket } from '../entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { TicketActivityType } from '../enums/ticket-activity-type.enum';
interface ActivityOptions {
    ticketId: string;
    performedById: string;
    organizationId: string;
    userId: string;
    type: TicketActivityType;
    data?: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare class TicketActivityService {
    private readonly activityRepository;
    private readonly ticketRepository;
    private readonly userRepository;
    private readonly eventEmitter;
    recordActivity(arg0: {
        ticketId: string;
        organizationId: string;
        userId: string;
        action: string;
        details: {
            status: import("../dto/create-ticket.dto").TicketStatus;
        };
    }): void;
    private readonly logger;
    constructor(activityRepository: Repository<TicketActivity>, ticketRepository: Repository<Ticket>, userRepository: Repository<User>, eventEmitter: EventEmitter2);
    logActivity(options: ActivityOptions): Promise<TicketActivity>;
    getTicketActivities(ticketId: string, options?: {
        types?: TicketActivityType[];
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        activities: TicketActivity[];
        total: number;
    }>;
    getUserActivities(userId: string, options?: {
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        activities: TicketActivity[];
        total: number;
    }>;
    getActivityDetails(activityId: string): Promise<TicketActivity>;
    getActivitySummary(ticketId: string, startDate: Date, endDate: Date): Promise<Record<TicketActivityType, number>>;
    private sanitizeActivityData;
    generateActivityReport(ticketId: string, startDate: Date, endDate: Date): Promise<any>;
    private calculateActivityTypeStats;
    private calculateUserActivityStats;
}
export {};
