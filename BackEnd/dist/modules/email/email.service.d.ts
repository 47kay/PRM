import { Repository } from 'typeorm';
import { EmailTemplate } from '../notifications/entities/email-template.entity';
import { EmailQueue } from '../notifications/entities/email-queue.entity';
import { EmailLog } from '../notifications/entities/email-log.entity';
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
    constructor(emailTemplateRepository: Repository<EmailTemplate>, emailQueueRepository: Repository<EmailQueue>, emailLogRepository: Repository<EmailLog>);
    sendAppointmentReminder(to: string, data: AppointmentReminderData): Promise<void>;
    private compileTemplate;
}
export {};
