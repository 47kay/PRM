// src/modules/tickets/services/tickets.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Ticket } from '../entities/ticket.entity';
import { TicketComment } from '../entities/ticket-comment.entity';
import { TicketAttachment } from '../entities/ticket-attachment.entity';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { CreateTicketDto, TicketStatus } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { CreateTicketCommentDto } from '../dto/ticket-comment.dto'; // Fixed import
import { BulkTicketAssignmentDto } from '../dto/ticket-assignment.dto'; // Updated import
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { User } from '../../users/entities/user.entity';
import { paginate } from 'nestjs-typeorm-paginate';


// Define a simplified assignment DTO for single assignment operations
interface SingleTicketAssignmentDto {
    assigneeId: string;
    note?: string;
}

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        @InjectRepository(TicketComment)
        private readonly commentRepository: Repository<TicketComment>,
        @InjectRepository(TicketAttachment)
        private readonly attachmentRepository: Repository<TicketAttachment>,
        @InjectRepository(TicketActivity)
        private readonly activityRepository: Repository<TicketActivity>,
        private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly eventEmitter: EventEmitter2,
        private readonly notificationsService: NotificationsService,

    ) { }
    async getRelatedTickets(ticketId: string, organizationId: string): Promise<any> {
        // Implement the logic to get related tickets
        return [];
    }

    async remove(
        id: string,
        organizationId: string
    ): Promise<void> {
        const ticket = await this.findOne(id, organizationId);

        // Make sure TicketStatus.DELETED exists in your enum
        ticket.status = TicketStatus.DELETED;
        ticket.deletedAt = new Date();

        await this.ticketRepository.save(ticket);
    }

    async reopenTicket(id: string, reopenDetails: { reason: string; organizationId: string; reopenedBy: string }) {
        // Implement the logic to reopen a ticket
        // Example:
        const ticket = await this.ticketRepository.findOne({ where: { id, organizationId: reopenDetails.organizationId } });
        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }
        ticket.status = TicketStatus.REOPENED;
        ticket.reopenReason = reopenDetails.reason;
        const reopenedByUser = await this.userRepository.findOne({ where: { id: reopenDetails.reopenedBy } });
        if (!reopenedByUser) {
            throw new NotFoundException('User not found');
        }
        ticket.reopenedBy = reopenedByUser;
        await this.ticketRepository.save(ticket);
        return ticket;
    }

    async create(data: CreateTicketDto & { organizationId: string; createdBy: string }): Promise<Ticket> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create ticket
            const createdByUser = await this.userRepository.findOne({ where: { id: data.createdBy } });
            if (!createdByUser) {
                throw new NotFoundException('User not found');
            }

            const ticket = this.ticketRepository.create({
                ...data,
                status: TicketStatus.OPEN,
                createdBy: createdByUser,
                attachments: data.attachments?.map(attachmentData => {
                    const attachment = new TicketAttachment();
                    Object.assign(attachment, attachmentData);
                    attachment.organizationId = data.organizationId;
                    attachment.uploadedById = data.createdBy;
                    return attachment;
                }),
            });

            await queryRunner.manager.save(ticket);

            // Handle attachments if any
            if (data.attachments?.length) {
                for (const attachmentData of data.attachments) {
                    const attachment = new TicketAttachment();

                    // Copy properties from attachment data (filename, fileType, etc.)
                    Object.assign(attachment, attachmentData);

                    // Set the relationships explicitly
                    attachment.ticketId = ticket.id;
                    attachment.organizationId = data.organizationId;
                    attachment.uploadedById = data.createdBy;

                    await queryRunner.manager.save(attachment);
                }
            }

            // Create activity record
            const activity = new TicketActivity();
            activity.ticketId = ticket.id;
            activity.organizationId = data.organizationId;
            activity.userId = data.createdBy;
            activity.action = 'CREATED';
            activity.details = { status: ticket.status };

            await queryRunner.manager.save(activity);

            await queryRunner.commitTransaction();

            // Send notifications
            if (ticket.assigneeId) {
                await this.notificationsService.create({
                    type: 'TICKET_ASSIGNED',
                    title: 'New Ticket Assigned',
                    content: `Ticket #${ticket.referenceNumber} has been assigned to you: ${ticket.title}`,
                    recipients: ticket.assigneeId ? [{ userId: ticket.assigneeId }] : [],
                    organizationId: data.organizationId,
                    senderId: data.createdBy,
                });
            }

            this.eventEmitter.emit('ticket.created', ticket);

            return ticket;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(query: TicketQueryDto & { organizationId: string }) {
        const {
            organizationId,
            status,
            priority,
            type,
            assigneeId,
            contactId,
            departmentId,
            search,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = query;

        const queryBuilder = this.ticketRepository
            .createQueryBuilder('ticket')
            .where('ticket.organizationId = :organizationId', { organizationId })
            .leftJoinAndSelect('ticket.assignee', 'assignee')
            .leftJoinAndSelect('ticket.contact', 'contact')
            .leftJoinAndSelect('ticket.department', 'department');

        if (status) {
            queryBuilder.andWhere('ticket.status = :status', { status });
        }

        if (priority) {
            queryBuilder.andWhere('ticket.priority = :priority', { priority });
        }

        if (type) {
            queryBuilder.andWhere('ticket.type = :type', { type });
        }

        if (assigneeId) {
            queryBuilder.andWhere('ticket.assigneeId = :assigneeId', { assigneeId });
        }

        if (contactId) {
            queryBuilder.andWhere('ticket.contactId = :contactId', { contactId });
        }

        if (departmentId) {
            queryBuilder.andWhere('ticket.departmentId = :departmentId', { departmentId });
        }

        if (search) {
            queryBuilder.andWhere(
                '(LOWER(ticket.title) LIKE LOWER(:search) OR LOWER(ticket.description) LIKE LOWER(:search) OR ticket.referenceNumber LIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (startDate) {
            queryBuilder.andWhere('ticket.createdAt >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('ticket.createdAt <= :endDate', { endDate });
        }

        queryBuilder.orderBy('ticket.createdAt', 'DESC');

        return paginate(queryBuilder, { page, limit });
    }

    async findOne(id: string, organizationId: string): Promise<Ticket> {
        // Using query builder to avoid TypeORM find() type issues
        const ticket = await this.ticketRepository
            .createQueryBuilder('ticket')
            .where('ticket.id = :id', { id })
            .andWhere('ticket.organizationId = :organizationId', { organizationId })
            .leftJoinAndSelect('ticket.assignee', 'assignee')
            .leftJoinAndSelect('ticket.contact', 'contact')
            .leftJoinAndSelect('ticket.department', 'department')
            .leftJoinAndSelect('ticket.comments', 'comments')
            .leftJoinAndSelect('ticket.attachments', 'attachments')
            .leftJoinAndSelect('ticket.activities', 'activities')
            .getOne();

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        return ticket;
    }

    async update(
        id: string,
        data: UpdateTicketDto & { organizationId: string; updatedBy: string }
    ): Promise<Ticket> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const ticket = await this.findOne(id, data.organizationId);
            const oldStatus = ticket.status;

            // Update ticket fields
            Object.assign(ticket, data);
            await queryRunner.manager.save(ticket);

            // Create activity record for status change
            if (data.status && data.status !== oldStatus) {
                const activity = new TicketActivity();
                activity.ticketId = ticket.id;
                activity.organizationId = data.organizationId;
                activity.userId = data.updatedBy;
                activity.action = 'STATUS_CHANGED';
                activity.details = {
                    oldStatus,
                    newStatus: data.status,
                    note: data.statusNote,
                };

                await queryRunner.manager.save(activity);

                // Send notification for status change
                if (ticket.assigneeId) {
                    await this.notificationsService.create({
                        type: 'TICKET_STATUS_CHANGED',
                        title: 'Ticket Status Updated',
                        content: `Ticket #${ticket.referenceNumber} status changed to ${data.status}`,
                        recipients: ticket.assigneeId ? [{ userId: ticket.assigneeId }] : [],
                        organizationId: data.organizationId,
                        senderId: data.updatedBy,
                    });
                }
            }

            await queryRunner.commitTransaction();
            return ticket;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async assignTicket(
        id: string,
        data: BulkTicketAssignmentDto & { organizationId: string; assignedBy: string }
    ): Promise<Ticket> {
        const ticket = await this.findOne(id, data.organizationId);
        const oldAssigneeId = ticket.assigneeId;
    
        ticket.assigneeId = data.assigneeId;
        await this.ticketRepository.save(ticket);
    
        // Create activity record
        const activity = new TicketActivity();
        activity.ticketId = ticket.id;
        activity.organizationId = data.organizationId;
        activity.userId = data.assignedBy;
        activity.action = 'ASSIGNED';
        activity.details = {
            oldAssigneeId,
            newAssigneeId: data.assigneeId,
            note: data.note,
        };
        
        await this.activityRepository.save(activity);
    
        // Send notification to new assignee
        await this.notificationsService.create({
            type: 'TICKET_ASSIGNED',
            title: 'Ticket Assigned',
            content: `Ticket #${ticket.referenceNumber} has been assigned to you`,
            recipients: [{ userId: data.assigneeId }],
            organizationId: data.organizationId,
            senderId: data.assignedBy,
        });
    
        return ticket;
    }

    async addComment(
        id: string,
        data: CreateTicketCommentDto & { organizationId: string; userId: string }
    ): Promise<TicketComment> {
        const ticket = await this.findOne(id, data.organizationId);

        // Create comment
        const comment = new TicketComment();
        // Copy properties from data (content, isInternal, etc.)
        Object.assign(comment, data);
        comment.ticketId = ticket.id;
        comment.organizationId = data.organizationId;
        comment.userId = data.userId;

        await this.commentRepository.save(comment);

        // Update ticket's last activity
        ticket.lastActivityAt = new Date();
        await this.ticketRepository.save(ticket);

        // Create activity record
        const activity = new TicketActivity();
        activity.ticketId = ticket.id;
        activity.organizationId = data.organizationId;
        activity.userId = data.userId;
        activity.action = 'COMMENTED';
        activity.details = { commentId: comment.id };

        await this.activityRepository.save(activity);

        // Send notification if internal note
        if (data.isInternal && ticket.assigneeId !== data.userId) {
            await this.notificationsService.create({
                type: 'TICKET_INTERNAL_NOTE',
                title: 'New Internal Note',
                content: `New internal note added to ticket #${ticket.referenceNumber}`,
                recipients: ticket.assigneeId ? [{ userId: ticket.assigneeId }] : [],
                organizationId: data.organizationId,
                senderId: data.userId,
            });
        }

        return comment;
    }

    async escalateTicket(
        id: string,
        data: { reason: string; organizationId: string; escalatedBy: string }
    ): Promise<Ticket> {
        const ticket = await this.findOne(id, data.organizationId);

        ticket.status = TicketStatus.ESCALATED;
        ticket.escalatedAt = new Date();
        ticket.escalatedById = data.escalatedBy;
        ticket.escalationReason = data.reason;

        await this.ticketRepository.save(ticket);

        // Create activity record
        const activity = new TicketActivity();
        activity.ticketId = ticket.id;
        activity.organizationId = data.organizationId;
        activity.userId = data.escalatedBy;
        activity.action = 'ESCALATED';
        activity.details = { reason: data.reason };

        await this.activityRepository.save(activity);

        // Notify administrators
        await this.notificationsService.create({
            type: 'TICKET_ESCALATED',
            title: 'Ticket Escalated',
            content: `Ticket #${ticket.referenceNumber} has been escalated: ${data.reason}`,
            priority: 'HIGH',
            recipients: [{ userId: 'ADMIN_USER_ID' }],
            organizationId: data.organizationId,
            senderId: data.escalatedBy,
        });

        return ticket;
    }

    async resolveTicket(
        id: string,
        data: { resolution: string; organizationId: string; resolvedBy: string }
    ): Promise<Ticket> {
        const ticket = await this.findOne(id, data.organizationId);

        ticket.status = TicketStatus.RESOLVED;
        ticket.resolvedAt = new Date();
        ticket.resolvedById = data.resolvedBy;
        ticket.resolution = data.resolution;

        await this.ticketRepository.save(ticket);

        // Create activity record
        const activity = new TicketActivity();
        activity.ticketId = ticket.id;
        activity.organizationId = data.organizationId;
        activity.userId = data.resolvedBy;
        activity.action = 'RESOLVED';
        activity.details = { resolution: data.resolution };

        await this.activityRepository.save(activity);

        // Notify ticket creator if different from resolver
        if (ticket.createdById !== data.resolvedBy) {
            await this.notificationsService.create({
                type: 'TICKET_RESOLVED',
                title: 'Ticket Resolved',
                content: `Your ticket #${ticket.referenceNumber} has been resolved`,
                recipients: [{ userId: ticket.createdById }],
                organizationId: data.organizationId,
                senderId: data.resolvedBy,
            });
        }

        return ticket;
    }

    async getAssignedTickets(query: TicketQueryDto & { organizationId: string; userId: string }) {
        const {
            organizationId,
            userId,
            status,
            priority,
            type,
            contactId,
            departmentId,
            search,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = query;

        const queryBuilder = this.ticketRepository
            .createQueryBuilder('ticket')
            .where('ticket.organizationId = :organizationId', { organizationId })
            .andWhere('ticket.assigneeId = :assigneeId', { assigneeId: userId })
            .leftJoinAndSelect('ticket.contact', 'contact')
            .leftJoinAndSelect('ticket.department', 'department');

        if (status) {
            queryBuilder.andWhere('ticket.status = :status', { status });
        }

        if (priority) {
            queryBuilder.andWhere('ticket.priority = :priority', { priority });
        }

        if (type) {
            queryBuilder.andWhere('ticket.type = :type', { type });
        }

        if (contactId) {
            queryBuilder.andWhere('ticket.contactId = :contactId', { contactId });
        }

        if (departmentId) {
            queryBuilder.andWhere('ticket.departmentId = :departmentId', { departmentId });
        }

        if (search) {
            queryBuilder.andWhere(
                '(LOWER(ticket.title) LIKE LOWER(:search) OR LOWER(ticket.description) LIKE LOWER(:search) OR ticket.referenceNumber LIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (startDate) {
            queryBuilder.andWhere('ticket.createdAt >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('ticket.createdAt <= :endDate', { endDate });
        }

        queryBuilder.orderBy('ticket.createdAt', 'DESC');

        return paginate(queryBuilder, { page, limit });
    }

    async getTimeline(id: string, organizationId: string) {
        // Using query builder to avoid TypeORM find() type issues
        const activities = await this.activityRepository
            .createQueryBuilder('activity')
            .where('activity.ticketId = :ticketId', { ticketId: id })
            .andWhere('activity.organizationId = :organizationId', { organizationId })
            .leftJoinAndSelect('activity.user', 'user')
            .orderBy('activity.createdAt', 'DESC')
            .getMany();

        return activities;
    }

    async getDashboard(organizationId: string) {
        const stats = await this.ticketRepository
            .createQueryBuilder('ticket')
            .where('ticket.organizationId = :organizationId', { organizationId })
            .select([
                'COUNT(*) as total',
                'COUNT(CASE WHEN status = :open THEN 1 END) as open',
                'COUNT(CASE WHEN status = :inProgress THEN 1 END) as inProgress',
                'COUNT(CASE WHEN status = :escalated THEN 1 END) as escalated',
                'COUNT(CASE WHEN priority = :urgent THEN 1 END) as urgent',
            ])
            .setParameter('open', TicketStatus.OPEN)
            .setParameter('inProgress', TicketStatus.IN_PROGRESS)
            .setParameter('escalated', TicketStatus.ESCALATED)
            .setParameter('urgent', 'URGENT')
            .getRawOne();

        return stats;
    }
}