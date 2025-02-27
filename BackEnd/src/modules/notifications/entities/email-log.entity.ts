import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmailStatus } from '../enums/email-status.enum';
import { Organization } from '../../organizations/entities/organization.entity';
import { EmailTemplate } from './email-template.entity';

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column('uuid', { nullable: true })
  templateId: string;

  @ManyToOne(() => EmailTemplate)
  @JoinColumn({ name: 'templateId' })
  template: EmailTemplate;

  @Column()
  recipient: string;

  @Column({ nullable: true })
  subject: string;

  @Column('text', { nullable: true })
  htmlContent: string;

  @Column('text', { nullable: true })
  textContent: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.PENDING
  })
  status: EmailStatus;

  @Column({ nullable: true })
  error: string;

  @Column({ nullable: true })
  messageId: string;

  @Column({ nullable: true })
  providerResponse: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  openedAt: Date;

  @Column({ nullable: true })
  clickedAt: Date;
}