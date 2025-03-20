import { Appointment } from './appointment.entity';
import { DayOfWeek } from '../enums/day-of-week.enum';
export declare class DoctorSchedule {
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
    appointments?: Appointment[];
    availableSlots?: {
        startTime: Date;
        endTime: Date;
        available: boolean;
        appointmentId?: string;
    }[];
    isTimeInRange(time: string): boolean;
    isDateInValidRange(date: Date): boolean;
    getDayNumber(): number;
    isBreakTime(time: string): boolean;
}
