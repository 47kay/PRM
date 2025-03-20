import { DayOfWeek } from '../enums/day-of-week.enum';
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
export interface AvailabilityCheckParams {
    doctorId: string;
    startTime: Date;
    endTime: Date;
    organizationId: string;
}
export interface ScheduleSlot {
    startTime: Date;
    endTime: Date;
    available: boolean;
    appointmentId?: string;
}
