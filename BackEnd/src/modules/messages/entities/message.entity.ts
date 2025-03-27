// src/modules/messages/entities/message.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    Index,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType, MessagePriority, MessageStatus } from '../dto/create-message.dto';
import { Organization } from '../../organizations/entities/organization.entity';
// Change to type-only import to break circular dependency
import type { User } from '../../users/entities/user.entity';
// Change to type-only import to break circular dependency
import type { Contact } from '../../contacts/entities/contact.entity';
import { MessageTemplate } from './message-template.entity';
import { MessageAttachment } from './message-attachment.entity';

@Entity('messages')
@Index(['organizationId', 'contactId'])
@Index(['organizationId', 'type'])
@Index(['organizationId', 'status'])
export class Message {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    organizationId: string;

    @ApiProperty()
    @Column({ type: 'enum', enum: MessageType })
    type: MessageType;

    @ApiProperty()
    @Column()
    contactId: string;

    @ApiProperty()
    @Column()
    senderId: string;

    @ApiProperty()
    @Column({ type: 'text' })
    content: string;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MessagePriority,
        default: MessagePriority.NORMAL,
    })
    priority: MessagePriority;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: MessageStatus,
        default: MessageStatus.QUEUED,
    })
    status: MessageStatus;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    emailOptions?: {
        subject: string;
        cc?: string;
        bcc?: string;
        trackOpens?: boolean;
        trackClicks?: boolean;
    };

    @ApiProperty()
    @Column({ nullable: true })
    templateId?: string;

    @ApiProperty()
    @Column({ nullable: true })
    scheduledFor?: Date;

    @ApiProperty()
    @Column({ default: false })
    requireConfirmation: boolean;

    @ApiProperty()
    @Column({ nullable: true })
    confirmedAt?: Date;

    @ApiProperty()
    @Column({ nullable: true })
    confirmedById?: string;

    @ApiProperty()
    @Column({ nullable: true })
    deliveredAt?: Date;

    @ApiProperty()
    @Column({ nullable: true })
    readAt?: Date;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    notes?: string;

    @ApiProperty()
    @Column({ nullable: true })
    externalId?: string;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    deliveryDetails?: {
        provider: string;
        providerMessageId?: string;
        attempts?: number;
        lastAttempt?: Date;
        errorCode?: string;
        errorMessage?: string;
    };

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;

    @ApiProperty()
    @Column({ nullable: true })
    parentMessageId?: string;

    @ApiProperty()
    @Column({ nullable: true })
    updatedById?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    // Relations
    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @ManyToOne('User')
    @JoinColumn({ name: 'senderId' })
    sender: User;

    @ManyToOne('User')
    @JoinColumn({ name: 'updatedById' })
    updatedBy?: User;

    @ManyToOne('User')
    @JoinColumn({ name: 'confirmedById' })
    confirmedBy?: User;

    @ManyToOne('Contact')
    @JoinColumn({ name: 'contactId' })
    contact: Contact;

    @ManyToOne(() => MessageTemplate)
    @JoinColumn({ name: 'templateId' })
    template?: MessageTemplate;

    @ManyToOne('Message')
    @JoinColumn({ name: 'parentMessageId' })
    parentMessage?: Message;

    @OneToMany('Message', 'parentMessage')
    replies?: Message[];

    @OneToMany('MessageAttachment', 'message')
    attachments?: MessageAttachment[];

    // Virtual properties
    @ApiProperty()
    get isRead(): boolean {
        return !!this.readAt;
    }

    @ApiProperty()
    get isConfirmed(): boolean {
        return !!this.confirmedAt;
    }

    @ApiProperty()
    get isDelivered(): boolean {
        return !!this.deliveredAt;
    }

    @ApiProperty()
    get isScheduled(): boolean {
        return !!this.scheduledFor && this.scheduledFor > new Date();
    }

    @ApiProperty()
    get isFailed(): boolean {
        return this.status === MessageStatus.FAILED;
    }
}