// src/modules/appointments/entities/appointment-reminder.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Appointment } from './appointment.entity';
  
  export enum ReminderType {
    EMAIL = 'email',
    SMS = 'sms',
    PUSH = 'push',
    WHATSAPP = 'whatsapp',
  }
  
  export enum ReminderStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
  }
  
  @Entity('appointment_reminders')
  export class AppointmentReminder {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    appointmentId: string;
  
    @ManyToOne(() => Appointment, appointment => appointment.reminderSent)
    @JoinColumn({ name: 'appointmentId' })
    appointment: Appointment;
  
    @Column({ type: 'enum', enum: ReminderType })
    type: ReminderType;
  
    @Column({ type: 'enum', enum: ReminderStatus, default: ReminderStatus.PENDING })
    status: ReminderStatus;
  
    @Column({ type: 'timestamp' })
    scheduledFor: Date;
  
    @Column({ nullable: true, type: 'timestamp' })
    sentAt?: Date;
  
    @Column({ nullable: true })
    content?: string;
  
    @Column({ nullable: true })
    recipientId?: string;
  
    @Column({ nullable: true })
    recipientEmail?: string;
  
    @Column({ nullable: true })
    recipientPhone?: string;
  
    @Column({ nullable: true, type: 'jsonb' })
    metadata?: Record<string, any>;
  
    @Column({ nullable: true, type: 'jsonb' })
    deliveryDetails?: {
      provider?: string;
      messageId?: string;
      error?: string;
      attempts?: number;
    };
  
    @Column()
    organizationId: string;
    
    @Column({ nullable: true })
    createdById?: string;
  
    @Column({ nullable: true })
    updatedById?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt?: Date;
  }