import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { WhatsAppMessageStatus } from '../enums/whatsapp-message-status.enum';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  TEMPLATE = 'TEMPLATE',
  INTERACTIVE = 'INTERACTIVE'
}

export enum MessageStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  UNKNOWN = "UNKNOWN"
}

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

@Entity('whatsapp_messages')
@Index(['organizationId', 'createdAt'])
@Index(['recipientPhone', 'createdAt'])
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  from: string;

  to: string; // Added 'to' property

  messageType: string;

  @Column('text', { nullable: true })
  content: string;



  receivedAt?: Date;

  lastError?: string;


  // status property removed to avoid duplication

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column('uuid', { nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  recipientPhone: string;

  @Column({ nullable: true })
  recipientName: string;

  @Column({
    type: 'enum',
    enum: MessageDirection,
    default: MessageDirection.OUTBOUND
  })
  direction: MessageDirection;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT
  })
  type: MessageType;

  // content property removed to avoid duplication

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  templateName: string;

  @Column('jsonb', { nullable: true })
  templateData: Record<string, any>;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.QUEUED
  })
  status: MessageStatus;

  @Column({ nullable: true })
  @Index()
  whatsappMessageId: string;

  @Column({ nullable: true })
  errorCode: string | null;

  @Column({ nullable: true })
  errorMessage: string | null;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  lastRetryAt: Date;

    @Column({ nullable: true })

    sentAt?: Date;

  @Column({ nullable: true })
  queuedAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date | null;

  @Column({ nullable: true })
  readAt: Date | null;
  failedAt: Date;

  @Column('jsonb', { nullable: true })
  attachments: {
    type: string;
    url: string;
    mimeType: string;
    filename?: string;
    size?: number;
  }[];

  @Column('jsonb', { nullable: true })
  locationData: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };

  @Column('jsonb', { nullable: true })
  contactData: {
    name: string;
    phones: string[];
    emails?: string[];
  }[];

  @Column('jsonb', { nullable: true })
  interactiveData: {
    type: string;
    title: string;
    body: string;
    buttons?: any[];
    selectedOption?: string;
  };

  @Column({ default: false })
  isScheduled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ default: false })
  requiresUserReply: boolean;

  @Column({ default: 0 })
  replyTimeoutHours: number;

  @Column({ nullable: true })
  replyDeadline: Date;

  @Column({ default: false })
  isAutomatedReply: boolean;

  @Column({ nullable: true })
  automationTriggerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Check if message can be retried
   */
  canRetry(): boolean {
    return (
      this.status === MessageStatus.FAILED &&
      this.retryCount < 3 &&
      !this.isExpired()
    );
  }

  /**
   * Check if message is expired
   */
  isExpired(): boolean {
    if (this.isScheduled && this.scheduledFor) {
      return this.scheduledFor < new Date();
    }
    if (this.requiresUserReply && this.replyDeadline) {
      return this.replyDeadline < new Date();
    }
    return false;
  }

  /**
   * Check if message needs to be sent now
   */
  shouldSendNow(): boolean {
    if (!this.isScheduled) {
      return true;
    }
    if (!this.scheduledFor) {
      return true;
    }
    return this.scheduledFor <= new Date();
  }

  /**
   * Update message status
   */
  updateStatus(status: MessageStatus): void {
    this.status = status;
    
    switch (status) {
      case MessageStatus.SENT:
        this.sentAt = new Date();
        break;
      case MessageStatus.DELIVERED:
        this.deliveredAt = new Date();
        break;
      case MessageStatus.READ:
        this.readAt = new Date();
        break;
      case MessageStatus.FAILED:
        this.failedAt = new Date();
        break;
    }
  }

  /**
   * Handle retry attempt
   */
  retry(): void {
    if (!this.canRetry()) {
      throw new Error('Message cannot be retried');
    }

    this.retryCount += 1;
    this.lastRetryAt = new Date();
    this.status = MessageStatus.QUEUED;
    this.errorCode = null;
    this.errorMessage = null;
  }
}