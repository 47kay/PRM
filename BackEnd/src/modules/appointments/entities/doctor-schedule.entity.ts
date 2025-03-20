// src/modules/appointments/entities/doctor-schedule.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { DayOfWeek } from '../enums/day-of-week.enum';

@Entity('doctor_schedules')
export class DoctorSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  doctorId: string;

  @Column()
  @Index()
  organizationId: string;

  @Column({ type: 'int', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  // Added to match service code
  @Column({ type: 'timestamp' })
  workStart: Date;

  @Column({ type: 'timestamp' })
  workEnd: Date;

  @Column({ type: 'int', default: 30 })
  slotDuration: number; // Duration of each appointment slot in minutes

  @Column({ type: 'int', default: 0 })
  breakBetweenSlots: number; // Buffer time between appointments in minutes

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  validFrom?: Date;

  @Column({ type: 'date', nullable: true })
  validTo?: Date;

  @Column({ nullable: true, type: 'jsonb' })
  breakTimes?: {
    startTime: string;
    endTime: string;
    reason?: string;
  }[];

  @Column({ nullable: true, type: 'jsonb' })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  virtualLink?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  slotCapacity?: number; // For group appointments/sessions

  @Column({ nullable: true })
  createdById?: string;

  @Column({ nullable: true })
  updatedById?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Virtual fields (not stored in database)
  appointments?: Appointment[]; // Related appointments for this schedule
  availableSlots?: {
    startTime: Date;
    endTime: Date;
    available: boolean;
    appointmentId?: string;
  }[];

  // Helper methods
  isTimeInRange(time: string): boolean {
    return time >= this.startTime && time <= this.endTime;
  }

  isDateInValidRange(date: Date): boolean {
    if (!this.validFrom && !this.validTo) return true;
    
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    
    if (this.validFrom) {
      const validFromDate = new Date(this.validFrom);
      validFromDate.setHours(0, 0, 0, 0);
      if (currentDate < validFromDate) return false;
    }
    
    if (this.validTo) {
      const validToDate = new Date(this.validTo);
      validToDate.setHours(0, 0, 0, 0);
      if (currentDate > validToDate) return false;
    }
    
    return true;
  }

  getDayNumber(): number {
    return this.dayOfWeek;
  }

  isBreakTime(time: string): boolean {
    if (!this.breakTimes || !this.breakTimes.length) return false;
    
    return this.breakTimes.some(
      breakTime => time >= breakTime.startTime && time < breakTime.endTime
    );
  }
}