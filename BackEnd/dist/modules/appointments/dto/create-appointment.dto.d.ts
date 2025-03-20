import { AppointmentType } from '../enums/appointment-type.enum';
import { AppointmentPriority } from '../enums/appointment-priority.enum';
export declare class CreateAppointmentDto {
    patientId: string;
    isRecurring?: boolean;
    recurrencePattern?: any;
    doctorId: string;
    startTime: string;
    endTime: string;
    type: AppointmentType;
    priority?: AppointmentPriority;
    title: string;
    description?: string;
    location?: string;
    meetingLink?: string;
    sendReminders?: boolean;
    reminderPreferences?: ReminderPreferencesDto;
    formData?: AppointmentFormDataDto;
    metadata?: AppointmentMetadataDto;
}
declare class ReminderPreferencesDto {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
    reminderTimes?: number[];
}
declare class AppointmentFormDataDto {
    chiefComplaint?: string;
    symptoms?: string[];
    duration?: string;
    notes?: string;
}
declare class AppointmentMetadataDto {
    referralSource?: string;
    insurance?: string;
    tags?: string[];
    externalId?: string;
}
export {};
