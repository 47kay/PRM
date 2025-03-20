// src/modules/appointments/interfaces/doctor-schedule.interface.ts

import { DayOfWeek } from '../enums/day-of-week.enum';

/**
 * Interface representing a doctor's schedule
 */
export interface IDoctorSchedule {
  id: string;
  doctorId: string;
  organizationId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  workStart: Date;
  workEnd: Date;
  slotDuration: number;
  breakBetweenSlots: number;
  isAvailable: boolean;
  isActive: boolean;
  validFrom?: Date;
  validTo?: Date;
  breakTimes?: {
    startTime: string;
    endTime: string;
    reason?: string;
  }[];
  metadata?: Record<string, any>;
  location?: string;
  virtualLink?: string;
  notes?: string;
  slotCapacity?: number;
  createdById?: string;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Interface for schedule update parameters
 */
export interface DoctorScheduleUpdateParams {
  startTime?: string;
  endTime?: string;
  workStart?: Date;
  workEnd?: Date;
  slotDuration?: number;
  breakBetweenSlots?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  validFrom?: Date;
  validTo?: Date;
  breakTimes?: {
    startTime: string;
    endTime: string;
    reason?: string;
  }[];
  location?: string;
  virtualLink?: string;
  notes?: string;
  slotCapacity?: number;
  metadata?: Record<string, any>;
  updatedById: string;
}

/**
 * Interface for doctor availability check parameters
 */
export interface AvailabilityCheckParams {
  doctorId: string;
  startTime: Date;
  endTime: Date;
  organizationId: string;
}

/**
 * Interface for schedule availability slot
 */
export interface ScheduleSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  appointmentId?: string;
}