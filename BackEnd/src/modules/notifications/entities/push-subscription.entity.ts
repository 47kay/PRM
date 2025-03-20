// src/modules/notifications/entities/push-subscription.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  import { Organization } from '../../organizations/entities/organization.entity';
  
  @Entity('push_subscriptions')
  @Index(['userId', 'endpoint'])
  @Index(['organizationId', 'active'])
  export class PushSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    @Index()
    userId: string;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @Column({ type: 'uuid' })
    @Index()
    organizationId: string;
  
    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;
  
    /**
     * The stringified push subscription object from the browser
     * Contains endpoint, keys (p256dh, auth), etc.
     */
    @Column({ type: 'text' })
    subscription: string;
  
    /**
     * The unique endpoint URL for this subscription
     * Used for querying and updating subscriptions
     */
    @Column({ type: 'text' })
    @Index()
    endpoint: string;
  
    /**
     * User agent information of the device/browser
     */
    @Column({ type: 'text', nullable: true })
    userAgent: string;
  
    /**
     * Whether this subscription is currently active
     */
    @Column({ type: 'boolean', default: true })
    active: boolean;
  
    /**
     * Last time a notification was successfully sent to this subscription
     */
    @Column({ type: 'timestamptz', nullable: true })
    lastUsed: Date;
  
    /**
     * Creation timestamp
     */
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    /**
     * Last update timestamp
     */
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
  }