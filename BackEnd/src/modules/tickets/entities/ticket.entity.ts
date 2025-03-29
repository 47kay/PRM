// src/modules/tickets/entities/ticket.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { 
    TicketType, 
    TicketPriority, 
    TicketStatus,
    TicketSource,
} from '../dto/create-ticket.dto';
// Remove direct entity imports that cause circular dependencies
// import { Organization } from '../../organizations/entities/organization.entity';
// import { User } from '../../users/entities/user.entity';
// import { Contact } from '../../contacts/entities/contact.entity';
import { Department } from '../../departments/entities/department.entity';
import { TicketComment } from './ticket-comment.entity';
import { TicketAttachment } from './ticket-attachment.entity';
import { TicketActivity } from './ticket-activity.entity';

@Entity('tickets')
@Index(['organizationId', 'status'])
@Index(['organizationId', 'assigneeId'])
@Index(['organizationId', 'contactId'])
@Index(['organizationId', 'departmentId'])
@Index(['organizationId', 'createdAt'])
export class Ticket {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    organizationId: string;

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty()
    @Column({ type: 'text' })
    description: string;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: TicketType,
    })
    type: TicketType;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.NORMAL,
    })
    priority: TicketPriority;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.OPEN,
    })
    status: TicketStatus;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: TicketSource,
        default: TicketSource.WEB,
    })
    source: TicketSource;

    @ApiProperty()
    @Column({ nullable: true })
    contactId?: string;

    @ApiProperty()
    @Column({ nullable: true })
    departmentId?: string;

    @ApiProperty()
    @Column({ nullable: true })
    assigneeId?: string;

    @ApiProperty()
    @Column({ nullable: true })
    category?: string;

    @ApiProperty()
    @Column({ nullable: true })
    subCategory?: string;

    @ApiProperty()
    @Column('simple-array', { nullable: true })
    tags?: string[];

    @ApiProperty()
    @Column({ nullable: true })
    referenceNumber?: string;

    @ApiProperty()
    @Column({ nullable: true })
    relatedTicketId?: string;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    customFields?: {
        patientId?: string;
        appointmentId?: string;
        medicalRecordId?: string;
        insuranceInfo?: {
            provider?: string;
            policyNumber?: string;
        };
        deviceInfo?: {
            type?: string;
            model?: string;
            serialNumber?: string;
        };
        [key: string]: any;
    };

    @ApiProperty()
    @Column({ default: false })
    isPrivate: boolean;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    internalNotes?: string;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    resolution?: string;

    @ApiProperty()
    @Column({ nullable: true })
    resolvedAt?: Date;

    @ApiProperty()
    @Column({ nullable: true })
    resolvedById?: string;

    @ApiProperty()
    @Column({ nullable: true })
    closedAt?: Date;

    @ApiProperty()
    @Column({ nullable: true })
    closedById?: string;

    @ApiProperty()
    @Column({ nullable: true })
    escalatedAt?: Date;

    @ApiProperty()
    @Column({ nullable: true })
    escalatedById?: string;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    escalationReason?: string;

    @ApiProperty()
    @Column({ nullable: true })
    reopenedAt?: Date;

    @ApiProperty()
    @Column({ nullable: true })
    reopenedById?: string;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    reopenReason?: string;

    @ApiProperty()
    @Column({ nullable: true })
    firstResponseAt?: Date;

    @ApiProperty()
    @Column({ nullable: true })
    lastActivityAt?: Date;

    @ApiProperty()
    @Column()
    createdById: string;

    @ApiProperty()
    @Column({ nullable: true })
    updatedById?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    // Relations - all using string references to avoid circular dependencies
    @ManyToOne('Organization')
    @JoinColumn({ name: 'organizationId' })
    organization: any;

    @ManyToOne('Contact')
    @JoinColumn({ name: 'contactId' })
    contact?: any;

    @ManyToOne(() => Department, { lazy: true })
    @JoinColumn({ name: 'departmentId' })
    department?: Promise<Department>;

    @ManyToOne('User')
    @JoinColumn({ name: 'assigneeId' })
    assignee?: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'createdById' })
    createdBy: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'updatedById' })
    updatedBy?: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'resolvedById' })
    resolvedBy?: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'closedById' })
    closedBy?: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'escalatedById' })
    escalatedBy?: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'reopenedById' })
    reopenedBy?: any;

    @ManyToOne('Ticket')
    @JoinColumn({ name: 'relatedTicketId' })
    relatedTicket?: any;

    @OneToMany('TicketComment', 'ticket')
    comments: any[];

    @OneToMany('TicketAttachment', 'ticket')
    attachments: any[];

    @OneToMany('TicketActivity', 'ticket')
    activities: any[];

    // Virtual properties
    @ApiProperty()
    get isEscalated(): boolean {
        return !!this.escalatedAt;
    }

    @ApiProperty()
    get isResolved(): boolean {
        return !!this.resolvedAt;
    }

    @ApiProperty()
    get isClosed(): boolean {
        return !!this.closedAt;
    }

    @ApiProperty()
    get isReopened(): boolean {
        return !!this.reopenedAt;
    }

    @ApiProperty()
    get hasFirstResponse(): boolean {
        return !!this.firstResponseAt;
    }

    @ApiProperty()
    get responseTime(): number | null {
        if (!this.firstResponseAt) return null;
        return this.firstResponseAt.getTime() - this.createdAt.getTime();
    }

    @ApiProperty()
    get resolutionTime(): number | null {
        if (!this.resolvedAt) return null;
        return this.resolvedAt.getTime() - this.createdAt.getTime();
    }
}