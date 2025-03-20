// src/modules/sms/entities/sms-template.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

/**
 * SMS template types for different scenarios
 */
export enum SmsTemplateType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  APPOINTMENT_FOLLOWUP = 'appointment_followup',
  GENERAL_NOTIFICATION = 'general_notification',
  CUSTOM = 'custom',
}

@Entity('sms_templates')
export class SmsTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ 
    type: 'enum', 
    enum: SmsTemplateType, 
    default: SmsTemplateType.CUSTOM 
  })
  type: SmsTemplateType;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true, length: 255 })
  description: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  @Index()
  organizationId: string;

  @Column({ nullable: true })
  createdById: string;

  @Column({ nullable: true })
  updatedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Sample variables that can be used in this template
   * Stored as a JSON object { variableName: description }
   */
  @Column({ type: 'json', nullable: true })
  sampleVariables: Record<string, string>;

  /**
   * The maximum allowed length for SMS (for reference)
   */
  @Column({ default: 160 })
  maxLength: number;

  /**
   * Optional metadata for additional properties
   */
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;
}