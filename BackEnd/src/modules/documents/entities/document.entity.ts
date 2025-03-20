// src/modules/documents/entities/document.entity.ts

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
import { Contact } from '../../contacts/entities/contact.entity';

export enum DocumentType {
    MEDICAL_RECORD = 'MEDICAL_RECORD',
    LAB_RESULT = 'LAB_RESULT',
    PRESCRIPTION = 'PRESCRIPTION',
    IMAGING = 'IMAGING',
    INSURANCE = 'INSURANCE',
    CONSENT_FORM = 'CONSENT_FORM',
    IDENTIFICATION = 'IDENTIFICATION',
    INVOICE = 'INVOICE',
    RECEIPT = 'RECEIPT',
    CORRESPONDENCE = 'CORRESPONDENCE',
    REFERRAL = 'REFERRAL',
    OTHER = 'OTHER',
}

export enum DocumentStatus {
    DRAFT = 'DRAFT',
    PENDING_REVIEW = 'PENDING_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
    ARCHIVED = 'ARCHIVED',
}

@Entity('documents')
@Index(['organizationId', 'contact'])
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    @Index()
    organizationId: string;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    contactId: string;

    @ManyToOne(() => Contact, contact => contact.documents, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'contactId' })
    contact: Contact;

    @Column({ length: 255 })
    name: string;

    @Column({
        type: 'enum',
        enum: DocumentType,
        default: DocumentType.OTHER,
    })
    type: DocumentType;

    @Column({ length: 255 })
    fileName: string;

    @Column({ length: 255 })
    fileType: string;

    @Column({ type: 'bigint' })
    fileSize: number;

    @Column({ length: 1024 })
    filePath: string;

    @Column({ length: 1024, nullable: true })
    fileUrl: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.APPROVED,
    })
    status: DocumentStatus;

    @Column({ type: 'boolean', default: false })
    isPrivate: boolean;

    @Column({ type: 'date', nullable: true })
    documentDate: Date;

    @Column({ type: 'date', nullable: true })
    expiryDate: Date;

    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        author?: string;
        source?: string;
        keywords?: string[];
        version?: string;
        pageCount?: number;
        isOriginal?: boolean;
        relatedDocuments?: string[]; // IDs of related documents
        customProperties?: Record<string, any>;
    };

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'jsonb', nullable: true })
    tags: string[];

    @Column({ type: 'jsonb', nullable: true })
    shareWith: string[]; // IDs of users/roles who can access this document

    @Column({ type: 'uuid', nullable: true })
    appointmentId: string;

    @Column({ type: 'uuid', nullable: true })
    medicalHistoryId: string;

    @Column({ type: 'text', nullable: true })
    contentText: string; // Extracted text content for searchability

    @Column({ type: 'uuid', nullable: true })
    @Index()
    createdById: string;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    updatedById: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date;
}