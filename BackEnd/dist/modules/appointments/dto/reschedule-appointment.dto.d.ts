export declare class RescheduleAppointmentDto {
    startTime: string;
    endTime: string;
    providerId?: string;
    reason?: string;
    notifyPatient?: boolean;
    notificationMessage?: string;
    requireConfirmation?: boolean;
    organizationId?: string;
    updatedBy?: string;
}
