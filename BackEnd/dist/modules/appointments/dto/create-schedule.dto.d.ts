declare class ScheduleSettingsDto {
    minAppointmentDuration?: number;
    appointmentBuffer?: number;
    maxAppointmentsPerDay?: number;
    preferredDuration?: number;
    allowOnlineBooking?: boolean;
    advanceBookingDays?: number;
}
export declare class CreateScheduleDto {
    doctorId: string;
    dayOfWeek: number;
    workStart: string;
    workEnd: string;
    breakStart?: string;
    breakEnd?: string;
    defaultAppointmentDuration: number;
    isActive?: boolean;
    settings?: ScheduleSettingsDto;
}
export {};
