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
import { TicketCommentDto } from '../dto/ticket-comment.dto';
import { TicketAssignmentDto } from '../dto/ticket-assignment.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { paginate } from 'nestjs-typeorm-paginate';

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
        private readonly eventEmitter: EventEmitter2,
        private readonly notificationsService: NotificationsService,
    ) {}

    async create(data: CreateTicketDto & { organizationId: string; createdBy: string }): Promise<Ticket> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create ticket
            const ticket = this.ticketRepository.create({
                ...data,
                status: TicketStatus.OPEN,
            });

            await queryRunner.manager.save(ticket);

            // Handle attachments if any
            if (data.attachments?.length) {
                const attachments = data.attachments.map(attachment =>
                    this.attachmentRepository.create({
                        ...attachment,
                        ticketId: ticket.id,
                        organizationId: data.organizationId,
                        uploadedById: data.createdBy,
                    })
                );
                await queryRunner.manager.save(TicketAttachment, attachments);
            }

            // Create activity record
            const activity = this.activityRepository.create({
                ticketId: ticket.id,
                organizationId: data.organizationId,
                userId: data.createdBy,
                action: 'CREATED',
                details: { status: ticket.status },
            });
            await queryRunner.manager.save(activity);

            await queryRunner.commitTransaction();

            // Send notifications
            if (ticket.assigneeId) {
                await this.notificationsService.create({
                    type: 'TICKET_ASSIGNED',
                    title: 'New Ticket Assigned',
                    content: `Ticket #${ticket.referenceNumber} has been assigned to you: ${ticket.title}`,
                    recipients: [{ userId: ticket.assigneeId }],
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
        const ticket = await this.ticketRepository.findOne({
            where: { id, organizationId },
            relations: [
                'assignee',
                'contact',
                'department',
                'comments',
                'attachments',
                'activities',
            ],
        });

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

            Object.assign(ticket, data);
            await queryRunner.manager.save(ticket);

            // Create activity record for status change
            if (data.status && data.status !== oldStatus) {
                const activity = this.activityRepository.create({
                    ticketId: ticket.id,
                    organizationId: data.organizationId,
                    userId: data.updatedBy,
                    action: 'STATUS_CHANGED',
                    details: {
                        oldStatus,
                        newStatus: data.status,
                        note: data.statusNote,
                    },
                });
                await queryRunner.manager.save(activity);

                // Send notification for status change
                if (ticket.assigneeId) {
                    await this.notificationsService.create({
                        type: 'TICKET_STATUS_CHANGED',
                        title: 'Ticket Status Updated',
                        content: `Ticket #${ticket.referenceNumber} status changed to ${data.status}`,
                        recipients: [{ userId: ticket.assigneeId }],
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
        data: TicketAssignmentDto & { organizationId: string; assignedBy: string }
    ): Promise<Ticket> {
        const ticket = await this.findOne(id, data.organizationId);
        const oldAssigneeId = ticket.assigneeId;

        ticket.assigneeId = data.assigneeId;
        await this.ticketRepository.save(ticket);

        // Create activity record
        await this.activityRepository.save({
            ticketId: ticket.id,
            organizationId: data.organizationId,
            userId: data.assignedBy,
            action: 'ASSIGNED',
            details: {
                oldAssigneeId,
                newAssigneeId: data.assigneeId,
                note: data.note,
            },
        });

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
        data: TicketCommentDto & { organizationId: string; userId: string }
    ): Promise<TicketComment> {
        const ticket = await this.findOne(id, data.organizationId);

        const comment = this.commentRepository.create({
            ...data,
            ticketId: ticket.id,
        });

        await this.commentRepository.save(comment);

        // Update ticket's last activity
        ticket.lastActivityAt = new Date();
        await this.ticketRepository.save(ticket);

        // Create activity record
        await this.activityRepository.save({
            ticketId: ticket.id,
            organizationId: data.organizationId,
            userId: data.userId,
            action: 'COMMENTED',
            details: { commentId: comment.id },
        });

        // Send notification if internal note
        if (data.isInternal && ticket.assigneeId !== data.userId) {
            await this.notificationsService.create({
                type: 'TICKET_INTERNAL_NOTE',
                title: 'New Internal Note',
                content: `New internal note added to ticket #${ticket.referenceNumber}`,
                recipients: [{ userId: ticket.assigneeId }],
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
        await this.activityRepository.save({
            ticketId: ticket.id,
            organizationId: data.organizationId,
            userId: data.escalatedBy,
            action: 'ESCALATED',
            details: { reason: data.reason },
        });

        // Notify administrators
        await this.notificationsService.create({
            type: 'TICKET_ESCALATED',
            title: 'Ticket Escalated',
            content: `Ticket #${ticket.referenceNumber} has been escalated: ${data.reason}`,
            priority: 'HIGH',
            recipients: [{ role: 'ADMIN' }],
            organizationId: data.organizationId,
            senderId: data.escalatedBy,
        });

        return ticket;
    }

    async getTimeline(id: string, organizationId: string) {
        const activities = await this.activityRepository.find({
            where: { ticketId: id, organizationId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

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