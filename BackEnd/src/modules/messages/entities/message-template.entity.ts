// src/modules/messages/entities/message-template.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// Change to type-only import to break circular dependency
import type { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum TemplateCategory {
    WELCOME = 'welcome',
    NOTIFICATION = 'notification',
    REMINDER = 'reminder',
    MARKETING = 'marketing',
    SUPPORT = 'support',
    CUSTOM = 'custom'
}

export enum TemplateType {
    SMS = 'sms',
    EMAIL = 'email',
    PUSH = 'push',
    IN_APP = 'in_app'
}

@Entity('message_templates')
export class MessageTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: TemplateCategory,
        default: TemplateCategory.CUSTOM
    })
    category: TemplateCategory;

    @Column({
        type: 'enum',
        enum: TemplateType
    })
    type: TemplateType;

    @Column()
    subject: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'jsonb', nullable: true })
    parameters: Record<string, any>;

    @Column({ default: false })
    isDefault: boolean;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne('User', { nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @Column({ name: 'created_by_id', nullable: true })
    createdById: string;

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ name: 'organization_id', nullable: true })
    organizationId: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}