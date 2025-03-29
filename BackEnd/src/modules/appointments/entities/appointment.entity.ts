// src/modules/appointments/entities/appointment.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { AppointmentType } from '../enums/appointment-type.enum';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { AppointmentPriority } from '../enums/appointment-priority.enum';
import { ApiProperty } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

// DO NOT import Contact directly - this is what causes the circular dependency

@Entity('appointments')
@Index(['organizationId', 'startTime'])
@Index(['doctorId', 'startTime'])
@Index(['patientId', 'startTime'])
export class Appointment {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty()
    @Column({ type: 'timestamp' })
    startTime: Date;

    @ApiProperty()
    @Column({ type: 'timestamp' })
    endTime: Date;

    @ApiProperty()
    @Column({ nullable: true })
    notes?: string;

    @Column({ type: 'uuid' })
    organizationId: string;

    @Column({ type: 'uuid' })
    patientId: string;

    @Column({ type: 'uuid' })
    doctorId: string;

    @Column({ type: 'uuid' })
    createdById: string;

    @Column({ type: 'uuid', nullable: true })
    updatedById?: string;

    @Column({ type: 'timestamp with time zone', nullable: true })
    confirmedAt?: Date;

    @Column({ type: 'timestamp with time zone' })
    scheduledFor: Date;

    @Column({
        type: 'enum',
        enum: AppointmentType,
        default: AppointmentType.IN_PERSON,
    })
    type: AppointmentType;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.SCHEDULED,
    })
    status: AppointmentStatus;

    @Column({
        type: 'enum',
        enum: AppointmentPriority,
        default: AppointmentPriority.NORMAL,
    })
    priority: AppointmentPriority;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 200, nullable: true })
    location: string;

    @Column({ length: 500, nullable: true })
    meetingLink: string;

    @Column({ type: 'boolean', default: true })
    sendReminders: boolean;

    @Column({ type: 'jsonb', nullable: true })
    reminderPreferences: {
        email: boolean;
        sms: boolean;
        whatsapp: boolean;
        reminderTimes: number[];
    };

    @Column({ type: 'jsonb', nullable: true })
    formData: {
        chiefComplaint?: string;
        symptoms?: string[];
        duration?: string;
        notes?: string;
        diagnosis?: string;
        treatmentPlan?: string;
        prescriptions?: string[];
        followUpInstructions?: string;
    };

    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        referralSource?: string;
        insurance?: string;
        tags?: string[];
        externalId?: string;
        followUpAppointmentId?: string;
        previousAppointmentId?: string;
        billingStatus?: string;
        claimStatus?: string;
        followUpSentAt?: string;
    };

    @Column({ type: 'boolean', default: false })
    isRecurring: boolean;

    @Column({ type: 'jsonb', nullable: true })
    recurrencePattern: {
        frequency: 'daily' | 'weekly' | 'monthly';
        interval: number;
        endDate?: Date;
        daysOfWeek?: number[];
    };

    @Column({ type: 'uuid', nullable: true })
    parentAppointmentId: string;

    @Column({ length: 500, nullable: true })
    cancellationReason: string;

    @Column({ length: 500, nullable: true })
    reschedulingReason: string;

    @Column({ type: 'boolean', default: false })
    reminderSent: boolean;

    @Column({ type: 'timestamp with time zone', nullable: true })
    reminderSentAt: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    checkedInAt: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    completedAt: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    cancelledAt: Date;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;

    // Relationships - use only string references for circular dependencies
    @ManyToOne('Organization', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: any;

    // FIXED: Keep only one relationship to Contact using patientId
    @ManyToOne('Contact', 'appointments', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patientId' })
    patient: any;

    // REMOVED the duplicate relationship that was here
    // @ManyToOne('Contact', 'appointments', { onDelete: 'CASCADE' })
    // @JoinColumn({ name: 'patientId' })
    // contact: any;

    @ManyToOne('User', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'doctorId' })
    doctor: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'createdById' })
    createdBy: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'updatedById' })
    updatedBy: any;

    @ManyToOne(() => Appointment, { nullable: true })
    @JoinColumn({ name: 'parentAppointmentId' })
    parentAppointment: Appointment;

    @OneToMany(() => Appointment, appointment => appointment.parentAppointment)
    recurrentAppointments: Appointment[];
    
    provider: any;

    // Helper methods
    isUpcoming(): boolean {
        return new Date() < this.startTime;
    }

    isInProgress(): boolean {
        const now = new Date();
        return now >= this.startTime && now <= this.endTime;
    }

    isOverdue(): boolean {
        return new Date() > this.endTime && this.status !== AppointmentStatus.COMPLETED;
    }

    getDuration(): number {
        return this.endTime.getTime() - this.startTime.getTime();
    }

    canBeModified(): boolean {
        return ![
            AppointmentStatus.COMPLETED,
            AppointmentStatus.CANCELLED,
        ].includes(this.status);
    }

    needsReminder(): boolean {
        if (!this.sendReminders || this.reminderSent || !this.isUpcoming()) {
            return false;
        }

        const now = new Date();
        const nextReminderTime = Math.min(
            ...this.reminderPreferences?.reminderTimes || [60]
        );
        const reminderDue = new Date(this.startTime.getTime() - nextReminderTime * 60000);

        return now >= reminderDue;
    }
}