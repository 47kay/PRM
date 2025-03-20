import { Repository } from 'typeorm';
import { EmailTemplate } from '../../notifications/entities/email-template.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { EmailQueue } from '../../notifications/entities/email-queue.entity';
import { EmailLog } from '../../notifications/entities/email-log.entity';
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
    private emailTemplateRepository;
    private emailQueueRepository;
    private emailLogRepository;
    private readonly logger;
    sendNotificationEmail(to: string, data: {
        notifications: Notification[];
        userName: string;
    }): Promise<void>;
    sendFollowUpEmail(email: string, details: any): Promise<void>;
    constructor(emailTemplateRepository: Repository<EmailTemplate>, emailQueueRepository: Repository<EmailQueue>, emailLogRepository: Repository<EmailLog>);
    sendMail(to: string, subject: string, body: string): Promise<void>;
    sendAppointmentReminder(to: string, data: AppointmentReminderData): Promise<void>;
    private compileTemplate;
}
export {};
