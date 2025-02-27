import { Repository } from 'typeorm';
import { EmailService } from '../modules/emails/email.service';
import { SmsService } from '../modules/sms/sms.service';
import { WhatsappService } from '../modules/whatsapp/whatsapp.service';
import { NotificationService } from '../modules/notifications/notification.service';
import { Appointment } from '../modules/appointments/entities/appointment.entity';
import { Contact } from '../modules/contacts/entities/contact.entity';
import { Organization } from '../modules/organizations/entities/organization.entity';
export declare class AppointmentReminderJob {
    private appointmentRepository;
    private contactRepository;
    private organizationRepository;
    private emailService;
    private smsService;
    private whatsappService;
    private notificationService;
    private readonly logger;
    constructor(appointmentRepository: Repository<Appointment>, contactRepository: Repository<Contact>, organizationRepository: Repository<Organization>, emailService: EmailService, smsService: SmsService, whatsappService: WhatsappService, notificationService: NotificationService);
    handleAppointmentReminders(): Promise<void>;
    private getUpcomingAppointments;
    private groupAppointmentsByReminderType;
    private processEmailReminders;
    private processSmsReminders;
    private processWhatsappReminders;
    private markReminderSent;
    cleanupOldReminders(): Promise<void>;
}
