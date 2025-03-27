// src/modules/contacts/entities/contact.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    Index,
    JoinColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ContactRelationship } from './contact-relationship.entity';

export enum ContactType {
    PATIENT = 'PATIENT',
    EMERGENCY_CONTACT = 'EMERGENCY_CONTACT',
    FAMILY_MEMBER = 'FAMILY_MEMBER',
    OTHER = 'OTHER',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
    PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum BloodType {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    UNKNOWN = 'UNKNOWN',
}

@Entity('contacts')
@Index(['organizationId', 'email'])
@Index(['organizationId', 'phoneNumber'])
export class Contact {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @ApiProperty()
    @Column({ nullable: true })
    status: string;
    
    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;
    
    @ApiProperty()
    @Column({ nullable: true })
    phone: string;

    @ApiProperty()
    @Column()
    organizationId: string;

    @ApiProperty()
    @Column({ type: 'enum', enum: ContactType, default: ContactType.PATIENT })
    type: ContactType;

    @ApiProperty()
    @Column()
    firstName: string;

    @ApiProperty()
    @Column()
    lastName: string;

    @ApiProperty()
    @Column({ nullable: true })
    middleName?: string;

    @ApiProperty()
    @Column({ nullable: true })
    preferredName?: string;

    @ApiProperty()
    @Column({ unique: true, nullable: true })
    @Index()
    email?: string;

    @ApiProperty()
    @Column({ nullable: true })
    phoneNumber?: string;

    @ApiProperty()
    @Column({ nullable: true })
    alternativePhoneNumber?: string;

    @ApiProperty()
    @Column({ type: 'enum', enum: Gender, nullable: true })
    gender?: Gender;

    @ApiProperty()
    @Column({ type: 'date', nullable: true })
    dateOfBirth?: Date;

    @ApiProperty()
    @Column({ type: 'enum', enum: BloodType, default: BloodType.UNKNOWN })
    bloodType: BloodType;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    emergencyContact?: {
        name: string;
        relationship: string;
        phoneNumber: string;
        address?: string;
    };

    @ApiProperty()
    @Column({ type: 'simple-array', nullable: true })
    allergies?: string[];

    @ApiProperty()
    @Column({ type: 'simple-array', nullable: true })
    medications?: string[];

    @ApiProperty()
    @Column({ nullable: true })
    occupation?: string;

    @ApiProperty()
    @Column({ nullable: true })
    notes?: string;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    customFields?: Record<string, any>;

    @ApiProperty()
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Column({ nullable: true })
    lastVisitDate?: Date;

    @ApiProperty()
    @Column({ nullable: true })
    nextAppointmentDate?: Date;

    @ApiProperty()
    @Column()
    createdById: string;

    @ApiProperty()
    @Column({ nullable: true })
    updatedById?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    // Relations - all using string references to avoid circular dependencies
    @ManyToOne('Organization')
    @JoinColumn({ name: 'organizationId' })
    organization: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'createdById' })
    createdBy: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'updatedById' })
    updatedBy: any;

    @OneToMany('Appointment', 'contact')
    appointments: any[];

    @OneToMany('Document', 'contact')
    documents: any[];

    @OneToMany('MedicalHistory', 'contact')
    medicalHistory: any[];

    @OneToMany(() => ContactRelationship, relationship => relationship.contact)
    relationships: ContactRelationship[];

    @ManyToMany('Contact')
    @JoinTable({
        name: 'contact_merged_records',
        joinColumn: { name: 'primary_contact_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'merged_contact_id', referencedColumnName: 'id' },
    })
    mergedRecords: any[];

    // Virtual properties
    @ApiProperty()
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    @ApiProperty()
    get age(): number | null {
        if (!this.dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
}