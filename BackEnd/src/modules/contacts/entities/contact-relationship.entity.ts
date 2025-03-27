// src/modules/contacts/entities/contact-relationship.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
} from 'typeorm';
// Use type-only import to break the circular dependency
import type { Contact } from './contact.entity';

/**
 * Represents different types of relationships between contacts
 */
export enum RelationshipType {
    SPOUSE = 'SPOUSE',
    PARENT = 'PARENT',
    CHILD = 'CHILD',
    SIBLING = 'SIBLING',
    GUARDIAN = 'GUARDIAN',
    DEPENDENT = 'DEPENDENT',
    EMERGENCY_CONTACT = 'EMERGENCY_CONTACT',
    PRIMARY_CARE_PROVIDER = 'PRIMARY_CARE_PROVIDER',
    SPECIALIST = 'SPECIALIST',
    CAREGIVER = 'CAREGIVER',
    RELATIVE = 'RELATIVE',
    COLLEAGUE = 'COLLEAGUE',
    FRIEND = 'FRIEND',
    OTHER = 'OTHER',
}

@Entity('contact_relationships')
@Index(['organizationId', 'contactId'])
@Index(['organizationId', 'relatedContactId'])
export class ContactRelationship {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    @Index()
    organizationId: string;

    @Column({ type: 'uuid' })
    @Index()
    contactId: string;

    @ManyToOne('Contact', {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'contactId' })
    contact: Contact;

    @Column({ type: 'uuid' })
    @Index()
    relatedContactId: string;

    @ManyToOne('Contact', {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'relatedContactId' })
    relatedContact: Contact;

    @Column({
        type: 'enum',
        enum: RelationshipType,
        default: RelationshipType.OTHER,
    })
    type: RelationshipType;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    isPrimary: boolean;

    @Column({ type: 'uuid', nullable: true })
    createdById: string;

    @Column({ type: 'uuid', nullable: true })
    updatedById: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date;

    /**
     * Custom metadata for the relationship (JSON field)
     * This can store additional information specific to the relationship type
     * For example, for a PARENT-CHILD relationship, it might store custodial information
     */
    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    /**
     * Inverse relationship type (if applicable)
     * For example, if this relationship is PARENT, the inverse would be CHILD
     * This helps maintain consistency when querying from either direction
     */
    @Column({
        type: 'enum',
        enum: RelationshipType,
        nullable: true,
    })
    inverseType: RelationshipType;

    /**
     * Start date of the relationship (if applicable)
     * For example, when a provider became a patient's specialist
     */
    @Column({ type: 'date', nullable: true })
    startDate: Date;

    /**
     * End date of the relationship (if applicable)
     * For example, when a provider stopped being a patient's specialist
     */
    @Column({ type: 'date', nullable: true })
    endDate: Date;
}