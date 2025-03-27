export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
interface AppointmentReminderData {
    appointmentId: string;
    patientName: string;
    doctorName: string;
    dateTime: Date;
    location: string;
    notes?: string;
    organizationName: string;
}
export declare class EmailService {
    private readonly logger;
    constructor();
    sendNotificationEmail(to: string, data: {
        notifications: any[];
        userName: string;
    }): Promise<void>;
    sendFollowUpEmail(email: string, details: any): Promise<void>;
    sendMail(to: string, subject: string, body: string): Promise<void>;
    sendAppointmentReminder(to: string, data: AppointmentReminderData): Promise<void>;
    private compileTemplate;
}
export {};
