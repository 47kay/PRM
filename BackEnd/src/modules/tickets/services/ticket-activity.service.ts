import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    userId: string; // Add this line
    type: TicketActivityType;
    data?: Record<string, any>;
    metadata?: Record<string, any>;
}

@Injectable()
export class TicketActivityService {
    recordActivity(arg0: { ticketId: string; organizationId: string; userId: string; action: string; details: { status: import("../dto/create-ticket.dto").TicketStatus; }; }) {
        throw new Error('Method not implemented.');
    }
    private readonly logger = new Logger(TicketActivityService.name);

    constructor(
        @InjectRepository(TicketActivity)
        private readonly activityRepository: Repository<TicketActivity>,
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async logActivity(options: ActivityOptions): Promise<TicketActivity> {
        try {
            // Verify ticket exists
            const ticket = await this.ticketRepository.findOne({
                where: { id: options.ticketId }
            });

            if (!ticket) {
                throw new Error(`Ticket ${options.ticketId} not found`);
            }

            // Create activity record
            const activity = this.activityRepository.create({
                ticketId: options.ticketId,
                performedById: options.performedById,
                type: options.type,
                data: this.sanitizeActivityData(options.data || {}),
                metadata: options.metadata || {},
                timestamp: new Date()
            });

            await this.activityRepository.save(activity);

            // Emit activity event
            this.eventEmitter.emit('ticket.activity.created', {
                activity,
                ticket
            });

            return activity;
        } catch (error) {
            this.logger.error('Error logging ticket activity:', error);
            throw error;
        }
    }

    async getTicketActivities(
        ticketId: string,
        options: {
            types?: TicketActivityType[];
            startDate?: Date;
            endDate?: Date;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<{ activities: TicketActivity[]; total: number }> {
        try {
            const queryBuilder = this.activityRepository
                .createQueryBuilder('activity')
                .where('activity.ticketId = :ticketId', { ticketId });

            // Apply filters
            if (options.types?.length) {
                queryBuilder.andWhere('activity.type IN (:...types)', { types: options.types });
            }

            if (options.startDate) {
                queryBuilder.andWhere('activity.timestamp >= :startDate', { startDate: options.startDate });
            }

            if (options.endDate) {
                queryBuilder.andWhere('activity.timestamp <= :endDate', { endDate: options.endDate });
            }

            // Add relations
            queryBuilder
                .leftJoinAndSelect('activity.performedBy', 'user')
                .orderBy('activity.timestamp', 'DESC');

            // Apply pagination
            if (options.limit) {
                queryBuilder.take(options.limit);
            }

            if (options.offset) {
                queryBuilder.skip(options.offset);
            }

            const [activities, total] = await queryBuilder.getManyAndCount();

            return { activities, total };
        } catch (error) {
            this.logger.error(`Error fetching activities for ticket ${ticketId}:`, error);
            throw error;
        }
    }

    async getUserActivities(
        userId: string,
        options: {
            startDate?: Date;
            endDate?: Date;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<{ activities: TicketActivity[]; total: number }> {
        try {
            const queryBuilder = this.activityRepository
                .createQueryBuilder('activity')
                .where('activity.performedById = :userId', { userId });

            if (options.startDate) {
                queryBuilder.andWhere('activity.timestamp >= :startDate', { startDate: options.startDate });
            }

            if (options.endDate) {
                queryBuilder.andWhere('activity.timestamp <= :endDate', { endDate: options.endDate });
            }

            // Add relations
            queryBuilder
                .leftJoinAndSelect('activity.ticket', 'ticket')
                .orderBy('activity.timestamp', 'DESC');

            // Apply pagination
            if (options.limit) {
                queryBuilder.take(options.limit);
            }

            if (options.offset) {
                queryBuilder.skip(options.offset);
            }

            const [activities, total] = await queryBuilder.getManyAndCount();

            return { activities, total };
        } catch (error) {
            this.logger.error(`Error fetching activities for user ${userId}:`, error);
            throw error;
        }
    }

    async getActivityDetails(activityId: string): Promise<TicketActivity> {
        try {
            const activity = await this.activityRepository.findOne({
                where: { id: activityId },
                relations: ['performedBy', 'ticket']
            });

            if (!activity) {
                throw new Error(`Activity ${activityId} not found`);
            }

            return activity;
        } catch (error) {
            this.logger.error(`Error fetching activity details for ${activityId}:`, error);
            throw error;
        }
    }

    async getActivitySummary(
        ticketId: string,
        startDate: Date,
        endDate: Date
    ): Promise<Record<TicketActivityType, number>> {
        try {
            const activities = await this.activityRepository
                .createQueryBuilder('activity')
                .select('activity.type', 'type')
                .addSelect('COUNT(*)', 'count')
                .where('activity.ticketId = :ticketId', { ticketId })
                .andWhere('activity.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
                .groupBy('activity.type')
                .getRawMany();

            // Convert to record
            return activities.reduce((acc, curr) => {
                acc[curr.type] = parseInt(curr.count, 10);
                return acc;
            }, {} as Record<TicketActivityType, number>);
        } catch (error) {
            this.logger.error(`Error generating activity summary for ticket ${ticketId}:`, error);
            throw error;
        }
    }

    private sanitizeActivityData(data: Record<string, any>): Record<string, any> {
        const sensitiveFields = ['password', 'token', 'secret', 'key'];
        const sanitized = { ...data };

        // Recursively sanitize sensitive data
        const sanitizeObject = (obj: Record<string, any>) => {
            for (const [key, value] of Object.entries(obj)) {
                if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                    obj[key] = '[REDACTED]';
                } else if (typeof value === 'object' && value !== null) {
                    sanitizeObject(value);
                }
            }
        };

        sanitizeObject(sanitized);
        return sanitized;
    }

    async generateActivityReport(
        ticketId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        try {
            const activities = await this.activityRepository.find({
                where: {
                    ticketId,
                    timestamp: Between(startDate, endDate)
                },
                relations: ['performedBy'],
                order: { timestamp: 'ASC' }
            });

            // Group activities by date
            const groupedActivities = activities.reduce((acc, activity) => {
                const date = activity.timestamp.toISOString().split('T')[0];
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(activity);
                return acc;
            }, {} as Record<string, TicketActivity[]>);

            // Calculate statistics
            const statistics = {
                totalActivities: activities.length,
                byType: this.calculateActivityTypeStats(activities),
                byUser: this.calculateUserActivityStats(activities),
                averageActivitiesPerDay: activities.length / (
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                ),
            };

            return {
                ticketId,
                period: { startDate, endDate },
                statistics,
                activities: groupedActivities,
            };
        } catch (error) {
            this.logger.error(`Error generating activity report for ticket ${ticketId}:`, error);
            throw error;
        }
    }

    private calculateActivityTypeStats(
        activities: TicketActivity[]
    ): Record<TicketActivityType, number> {
        return activities.reduce((acc, activity) => {
            acc[activity.type] = (acc[activity.type] || 0) + 1;
            return acc;
        }, {} as Record<TicketActivityType, number>);
    }

    private calculateUserActivityStats(
        activities: TicketActivity[]
    ): Record<string, number> {
        return activities.reduce((acc, activity) => {
            const userId = activity.performedById;
            acc[userId] = (acc[userId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }
}

function Between(startDate: Date, endDate: Date): Date | import("typeorm").FindOperator<Date> | undefined {
    throw new Error('Function not implemented.');
}
