// src/modules/email/entities/email-log.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index
  } from 'typeorm';
  
  export enum EmailStatus {
    QUEUED = 'QUEUED',
    SENDING = 'SENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    BOUNCED = 'BOUNCED'
  }
  
  @Entity('email_logs')
  export class EmailLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ nullable: true })
    jobId?: string;
  
    @Column()
    to: string;
  
    @Column({ nullable: true })
    cc?: string;
  
    @Column({ nullable: true })
    bcc?: string;
  
    @Column()
    subject: string;
  
    @Column()
    template: string;
  
    @Column({ type: 'json', nullable: true })
    context?: Record<string, any>;
  
    @Column({
      type: 'enum',
      enum: EmailStatus,
      default: EmailStatus.QUEUED
    })
    status: string;
  
    @Column({ nullable: true })
    error?: string;
  
    @Column({ nullable: true })
    @Index()
    organizationId?: string;
  
    @Column({ nullable: true })
    userId?: string;
  
    @CreateDateColumn()
    @Index()
    createdAt: Date;
  
    @Column({ nullable: true })
    sentAt?: Date;
  }