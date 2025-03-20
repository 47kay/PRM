// src/modules/sms/entities/sms-log.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SmsTemplate } from '../entities/sms-template.entity';

/**
 * Status of SMS delivery
 */
export enum SmsStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  UNDELIVERED = 'undelivered',
  REJECTED = 'rejected',
}

/**
 * Entity to log all SMS communications
 */
@Entity('sms_logs')
export class SmsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  to: string;

  @Column({ nullable: true })
  from: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: SmsStatus,
    default: SmsStatus.PENDING,
  })
  status: SmsStatus;

  @Column({ nullable: true })
  statusMessage: string;

  @Column({ nullable: true })
  @Index()
  externalId: string;

  @Column({ nullable: true })
  @Index()
  organizationId: string;

  @Column({ nullable: true })
  @Index()
  appointmentId: string;

  @Column({ nullable: true })
  @Index()
  contactId: string;

  @Column({ nullable: true })
  @Index()
  templateId: string;

  @ManyToOne(() => SmsTemplate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'templateId' })
  template: SmsTemplate;

  @Column({ nullable: true })
  provider: string;

  @Column({ type: 'json', nullable: true })
  variables: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  providerResponse: Record<string, any>;

  @Column({ nullable: true })
  segments: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cost: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  @Index()
  createdById: string;

  /**
   * Optional metadata for additional properties
   */
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;
}