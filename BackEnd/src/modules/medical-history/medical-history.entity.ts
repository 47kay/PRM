// src/modules/medical-history/entities/medical-history.entity.ts

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
import { Contact } from '../contacts/entities/contact.entity';

export enum EncounterType {
    CONSULTATION = 'CONSULTATION',
    CHECKUP = 'CHECKUP',
    PROCEDURE = 'PROCEDURE',
    TREATMENT = 'TREATMENT',
    FOLLOW_UP = 'FOLLOW_UP',
    EMERGENCY = 'EMERGENCY',
    LABORATORY = 'LABORATORY',
    IMAGING = 'IMAGING',
    TELEMEDICINE = 'TELEMEDICINE',
    OTHER = 'OTHER',
}

export enum HealthcareProviderType {
    PRIMARY_CARE = 'PRIMARY_CARE',
    SPECIALIST = 'SPECIALIST',
    DENTIST = 'DENTIST',
    NURSE = 'NURSE',
    THERAPIST = 'THERAPIST',
    PHARMACIST = 'PHARMACIST',
    OTHER = 'OTHER',
}

@Entity('medical_histories')
@Index(['organizationId', 'contact'])
export class MedicalHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    @Index()
    organizationId: string;

    @Column({ type: 'uuid' })
    @Index()
    contactId: string;

    @ManyToOne(() => Contact, contact => contact.medicalHistory, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'contactId' })
    contact: Contact;

    @Column({
        type: 'enum',
        enum: EncounterType,
        default: EncounterType.CONSULTATION,
    })
    encounterType: EncounterType;

    @Column({ type: 'date' })
    @Index()
    date: Date;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    diagnosis: string;

    @Column({ type: 'text', nullable: true })
    treatment: string;

    @Column({ type: 'text', nullable: true })
    medications: string;

    @Column({ type: 'text', nullable: true })
    symptoms: string;

    @Column({ type: 'jsonb', nullable: true })
    vitalSigns: {
        bloodPressure?: string; // e.g., "120/80"
        temperature?: number; // in Celsius
        heartRate?: number; // in BPM
        respiratoryRate?: number; // in breaths per minute
        oxygenSaturation?: number; // as percentage
        height?: number; // in cm
        weight?: number; // in kg
        bmi?: number; // calculated Body Mass Index
    };

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'jsonb', nullable: true })
    referrals: {
        to: string;
        reason: string;
        date: Date;
        status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    }[];

    @Column({ type: 'jsonb', nullable: true })
    attachments: {
        id: string;
        name: string;
        type: string;
        url: string;
    }[];

    @Column({ type: 'jsonb', nullable: true })
    labResults: {
        test: string;
        result: string;
        normalRange: string;
        date: Date;
        isAbnormal: boolean;
    }[];

    @Column({ type: 'boolean', default: false })
    isFlagged: boolean;

    @Column({ type: 'text', nullable: true })
    flaggedReason: string;

    @Column({ type: 'boolean', default: false })
    requiresFollowUp: boolean;

    @Column({ type: 'date', nullable: true })
    followUpDate: Date;

    @Column({ type: 'varchar', nullable: true })
    providerName: string;

    @Column({
        type: 'enum',
        enum: HealthcareProviderType,
        nullable: true,
    })
    providerType: HealthcareProviderType;

    @Column({ type: 'varchar', nullable: true })
    facilityName: string;

    @Column({ type: 'varchar', nullable: true })
    facilityLocation: string;

    @Column({ type: 'boolean', default: false })
    isInsuranceClaim: boolean;

    @Column({ type: 'varchar', nullable: true })
    insuranceClaimNumber: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    costAmount: number;

    @Column({ type: 'varchar', nullable: true })
    costCurrency: string;

    @Column({ type: 'jsonb', nullable: true })
    customFields: Record<string, any>;

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
}