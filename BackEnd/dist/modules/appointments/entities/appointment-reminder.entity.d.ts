import { Appointment } from './appointment.entity';
export declare enum ReminderType {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    WHATSAPP = "whatsapp"
}
export declare enum ReminderStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class AppointmentReminder {
    id: string;
    appointmentId: string;
    appointment: Appointment;
    type: ReminderType;
    status: ReminderStatus;
    scheduledFor: Date;
    sentAt?: Date;
    content?: string;
    recipientId?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    metadata?: Record<string, any>;
    deliveryDetails?: {
        provider?: string;
        messageId?: string;
        error?: string;
        attempts?: number;
    };
    organizationId: string;
    createdById?: string;
    updatedById?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
