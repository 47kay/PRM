import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmailStatus } from '../enums/email-status.enum';
import { Organization } from '../../organizations/entities/organization.entity';
import { EmailTemplate } from './email-template.entity';

@Entity('email_queue')
export class EmailQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()

  @Column()

  priority: number;

  @Column()

  attempts: number;

  @Column()

  maxAttempts: number;

  @Column({ nullable: true })

  lastError: string;

  @CreateDateColumn()

  createdAt: Date;

  @UpdateDateColumn()

  updatedAt: Date;

  @Column({ nullable: true })

  sentAt: Date;

  @Column('json')

  data: any;

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
  variables: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.PENDING
  })
  status: EmailStatus;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date;

  @Column({ nullable: true })
  processedAt: Date;
}