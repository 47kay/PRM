import { AppointmentType } from '../enums/appointment-type.enum';
import { AppointmentPriority } from '../enums/appointment-priority.enum';
import { AppointmentStatus } from '../enums/appointment-status.enum';
export declare class UpdateAppointmentDto {
    doctorId?: string;
    startTime?: string;
    endTime?: string;
    type?: AppointmentType;
    priority?: AppointmentPriority;
    status?: AppointmentStatus;
    title?: string;
    description?: string;
    location?: string;
    meetingLink?: string;
    sendReminders?: boolean;
    reminderPreferences?: UpdateReminderPreferencesDto;
    formData?: UpdateAppointmentFormDataDto;
    metadata?: UpdateAppointmentMetadataDto;
    cancellationReason?: string;
    reschedulingReason?: string;
}
export declare class UpdateReminderPreferencesDto {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
    reminderTimes?: number[];
}
export declare class UpdateAppointmentFormDataDto {
    chiefComplaint?: string;
    symptoms?: string[];
    duration?: string;
    notes?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    prescriptions?: string[];
    followUpInstructions?: string;
}
export declare class UpdateAppointmentMetadataDto {
    referralSource?: string;
    insurance?: string;
    tags?: string[];
    externalId?: string;
    followUpAppointmentId?: string;
    previousAppointmentId?: string;
    billingStatus?: string;
    claimStatus?: string;
}
