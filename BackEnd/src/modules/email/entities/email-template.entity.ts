// src/modules/email/entities/email-template.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Email template status enum
 */
export enum EmailTemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

/**
 * Email template type enum
 */
export enum EmailTemplateType {
  TRANSACTIONAL = 'transactional',
  MARKETING = 'marketing',
  NOTIFICATION = 'notification',
  REPORT = 'report',
  GENERAL = 'general'
}

/**
 * Email template entity
 */
@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  @Index()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: EmailTemplateType, default: EmailTemplateType.GENERAL })
  type: EmailTemplateType;

  @Column({ type: 'enum', enum: EmailTemplateStatus, default: EmailTemplateStatus.DRAFT })
  status: EmailTemplateStatus;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true, type: 'text' })
  plainTextContent?: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true, type: 'jsonb' })
  variables?: Record<string, {
    type: string;
    description?: string;
    required?: boolean;
    defaultValue?: any;
  }>;

  @Column({ nullable: true, type: 'jsonb' })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  previewText?: string;

  @Column({ nullable: true })
  fromEmail?: string;

  @Column({ nullable: true })
  fromName?: string;

  @Column({ nullable: true })
  replyToEmail?: string;

  @Column({ nullable: true })
  headerImageUrl?: string;

  @Column({ nullable: true })
  footerContent?: string;

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

  @Column({ nullable: true })
  lastUsedAt?: Date;

  @Column({ default: 0 })
  useCount: number;

  /**
   * Processes template content by replacing variable placeholders with values
   * @param variables The values to replace placeholders with
   * @returns Processed email content
   */
  processContent(variables: Record<string, any>): string {
    if (!variables) return this.content;

    let processedContent = this.content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedContent = processedContent.replace(regex, String(value ?? ''));
    }
    
    return processedContent;
  }

  /**
   * Processes email subject by replacing variable placeholders with values
   * @param variables The values to replace placeholders with
   * @returns Processed email subject
   */
  processSubject(variables: Record<string, any>): string {
    if (!variables) return this.subject;
    
    let processedSubject = this.subject;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedSubject = processedSubject.replace(regex, String(value ?? ''));
    }
    
    return processedSubject;
  }
}