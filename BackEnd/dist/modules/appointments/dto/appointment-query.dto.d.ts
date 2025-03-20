export declare enum AppointmentStatus {
    SCHEDULED = "SCHEDULED",
    CONFIRMED = "CONFIRMED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare class AppointmentQueryDto {
    page?: number;
    limit?: number;
    doctorId?: string;
    providerId?: string;
    patientId?: string;
    status?: AppointmentStatus[];
    startDate?: Date;
    endDate?: Date;
    search?: string;
    upcoming?: boolean;
    past?: boolean;
    today?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    organizationId?: string;
}
