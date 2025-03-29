import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  WHATSAPP = 'WHATSAPP',
  SLACK = 'SLACK',
  WEBHOOK = 'WEBHOOK',
}

export enum NotificationCategory {
  APPOINTMENT = 'APPOINTMENT',
  TICKET = 'TICKET',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
  BILLING = 'BILLING',
  MESSAGING = 'MESSAGING',
  TASK = 'TASK',
  REMINDER = 'REMINDER',
  ALERT = 'ALERT',
  NEWS = 'NEWS',
}

export enum NotificationFrequency {
  IMMEDIATELY = 'IMMEDIATELY',
  DAILY_DIGEST = 'DAILY_DIGEST',
  WEEKLY_DIGEST = 'WEEKLY_DIGEST',
  CUSTOM = 'CUSTOM',
  NEVER = 'NEVER',
}

@Entity('notification_preferences')
@Index(['organizationId', 'userId'])
@Index(['organizationId', 'category'])
@Check(`"startTime" < "endTime"`)
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationCategory,
  })
  category: NotificationCategory;

  @ApiProperty({ 
    type: 'array',
    items: { 
      type: 'string', 
      enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WHATSAPP', 'SLACK', 'WEBHOOK']
    },
    description: 'Notification channels'
  })
  @Column({
    type: 'enum',
    enum: NotificationChannel,
    array: true,
    default: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
  })
  channels: NotificationChannel[];
  
  @ApiProperty({ 
    type: 'array',
    items: { 
      type: 'string', 
      enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WHATSAPP', 'SLACK', 'WEBHOOK']
    },
    description: 'Enabled notification channels'
  })
  @Column({
    type: 'enum',
    enum: NotificationChannel,
    array: true,
    default: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
  })
  enabledChannels: NotificationChannel[];

  @Column({
    type: 'enum',
    enum: NotificationFrequency,
    default: NotificationFrequency.IMMEDIATELY,
  })
  frequency: NotificationFrequency;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'time', nullable: true })
  startTime?: string;

  @Column({ type: 'time', nullable: true })
  endTime?: string;

  @Column('text', { array: true, nullable: true })
  workDays?: string[];

  @Column({ type: 'jsonb', nullable: true })
  customSchedule?: {
    days: string[];
    times: string[];
    timezone: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  channelSpecificSettings?: {
    email?: {
      addresses?: string[];
      format?: 'HTML' | 'TEXT';
      includeAttachments?: boolean;
    };
    sms?: {
      phoneNumbers?: string[];
      includeMedia?: boolean;
    };
    push?: {
      deviceTokens?: string[];
      sound?: boolean;
      badge?: boolean;
    };
    inApp?: {
      showBadge?: boolean;
      playSound?: boolean;
      markAsRead?: boolean;
    };
    whatsapp?: {
      numbers?: string[];
      allowMedia?: boolean;
    };
    slack?: {
      channels?: string[];
      mentionUser?: boolean;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  filters?: {
    priority?: string[];
    status?: string[];
    types?: string[];
    senders?: string[];
    keywords?: string[];
    excludeKeywords?: string[];
  };

  @Column({ type: 'int', default: 0 })
  importanceThreshold: number;

  @Column({ default: false })
  muteAll: boolean;

  @Column({ type: 'timestamp', nullable: true })
  muteUntil?: Date;

  @Column({ type: 'jsonb', nullable: true })
  digestSettings?: {
    groupBy?: string[];
    sortBy?: string;
    maxItems?: number;
    format?: string;
  };

  @Column({ default: true })
  allowReminders: boolean;

  @Column({ type: 'int', nullable: true })
  reminderInterval?: number;

  @Column({ type: 'int', default: 3 })
  maxReminders: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true })
  createdById?: string;

  @Column({ nullable: true })
  updatedById?: string;

  // Relations with ApiProperty decorators to break circular references
  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' }
    }
  })
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string' }
    }
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' }
    },
    nullable: true
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy?: User;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' }
    },
    nullable: true
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedById' })
  updatedBy?: User;
}