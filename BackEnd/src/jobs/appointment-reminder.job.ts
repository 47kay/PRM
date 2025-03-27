// src/jobs/appointment-reminder.job.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, In, FindOptionsWhere } from 'typeorm';
// Fixed import path - adjust based on actual location
import { EmailService } from '../modules/notifications/services/email.service';
import { SmsService } from '../modules/sms/services/sms.service';
import { WhatsappService } from '../modules/whatsapp/services/whatsapp.services';
import { NotificationsService } from '../modules/notifications/services/notifications.service';
import { Appointment } from '../modules/appointments/entities/appointment.entity';
import { Contact } from '../modules/contacts/entities/contact.entity';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { AppointmentStatus } from '../modules/appointments/enums/appointment-status.enum';

// This interface adds typed relations to the Appointment entity
interface AppointmentWithRelations {
  id: string;
  startTime: Date;
  status: string;
  reminderSent: boolean;
  contact?: ContactWithPreferences;
  doctor?: {
    firstName: string;
    lastName: string;
  };
  organization?: {
    name: string;
  };
  location?: string;
  notes?: string;
}

// Fixed interface to correctly extend Contact
interface ContactWithPreferences {
  id: string; // Required fields from Contact
  firstName: string;
  lastName: string;
  // Optional fields
  allowEmail?: boolean;
  allowSMS?: boolean;
  allowWhatsApp?: boolean;
  email?: string;
  phone?: string;
  whatsapp?: string;
}

@Injectable()
export class AppointmentReminderJob {
    private readonly logger = new Logger(AppointmentReminderJob.name);

    constructor(
        @InjectRepository(Appointment)
        private appointmentRepository: Repository<Appointment>,
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
        private emailService: EmailService,
        private smsService: SmsService,
        private whatsappService: WhatsappService,
        private notificationService: NotificationsService,
    ) {}

    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleAppointmentReminders() {
        try {
            this.logger.log('Starting appointment reminder job');
            
            // Get upcoming appointments for the next 24 hours
            const appointments = await this.getUpcomingAppointments();
            
            // Group appointments by reminder type
            const reminderGroups = this.groupAppointmentsByReminderType(appointments);
            
            // Process each reminder group
            await Promise.all([
                this.processEmailReminders(reminderGroups.email),
                this.processSmsReminders(reminderGroups.sms),
                this.processWhatsappReminders(reminderGroups.whatsapp),
            ]);

            this.logger.log(`Processed ${appointments.length} appointment reminders`);
        } catch (error) {
            this.logger.error('Error processing appointment reminders:', error);
            // Notify admin or monitoring service
            await this.notificationService.notifyError('Appointment Reminder Job', error);
        }
    }

    private async getUpcomingAppointments(): Promise<AppointmentWithRelations[]> {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Using proper type casting to avoid type errors
        const whereClause = {
            startTime: LessThanOrEqual(tomorrow),
            status: AppointmentStatus.CONFIRMED,
            reminderSent: false,
        } as FindOptionsWhere<Appointment>;

        return this.appointmentRepository.find({
            where: whereClause,
            relations: ['contact', 'doctor', 'organization'],
            order: {
                startTime: 'ASC',
            },
        }) as Promise<AppointmentWithRelations[]>;
    }

    private groupAppointmentsByReminderType(appointments: AppointmentWithRelations[]) {
        return appointments.reduce(
            (acc, appointment) => {
                if (!appointment.contact) {
                    this.logger.warn(`Appointment ${appointment.id} has no contact information`);
                    return acc;
                }
                
                if (appointment.contact.allowEmail && appointment.contact.email) {
                    acc.email.push(appointment);
                }
                if (appointment.contact.allowSMS && appointment.contact.phone) {
                    acc.sms.push(appointment);
                }
                if (appointment.contact.allowWhatsApp && appointment.contact.whatsapp) {
                    acc.whatsapp.push(appointment);
                }
                
                return acc;
            },
            { email: [], sms: [], whatsapp: [] } as Record<string, AppointmentWithRelations[]>,
        );
    }

    private async processEmailReminders(appointments: AppointmentWithRelations[]) {
        for (const appointment of appointments) {
            try {
                if (!appointment.contact || !appointment.doctor || !appointment.organization) {
                    this.logger.warn(`Skipping email reminder for appointment ${appointment.id}: missing required relation`);
                    continue;
                }
                
                await this.emailService.sendAppointmentReminder(
                    appointment.contact.email || '',
                    {
                        appointmentId: appointment.id,
                        patientName: `${appointment.contact.firstName || ''} ${appointment.contact.lastName || ''}`.trim(),
                        doctorName: `Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`.trim(),
                        dateTime: appointment.startTime,
                        location: appointment.location || 'N/A',
                        notes: appointment.notes || '',
                        organizationName: appointment.organization.name || 'N/A',
                    },
                );

                await this.markReminderSent(appointment.id);
            } catch (error) {
                this.logger.error(`Error sending email reminder for appointment ${appointment.id}:`, error);
            }
        }
    }

    private async processSmsReminders(appointments: AppointmentWithRelations[]) {
        for (const appointment of appointments) {
            try {
                if (!appointment.contact || !appointment.organization) {
                    this.logger.warn(`Skipping SMS reminder for appointment ${appointment.id}: missing required relation`);
                    continue;
                }

                await this.smsService.sendAppointmentReminder({
                    id: appointment.id,
                    contact: {
                        phone: appointment.contact.phone || '',
                        firstName: appointment.contact.firstName || '',
                        lastName: appointment.contact.lastName || ''
                    },
                    dateTime: appointment.startTime,
                    organization: {
                        name: appointment.organization.name || 'N/A'
                    }
                });

                await this.markReminderSent(appointment.id);
            } catch (error) {
                this.logger.error(`Error sending SMS reminder for appointment ${appointment.id}:`, error);
            }
        }
    }

    private async processWhatsappReminders(appointments: AppointmentWithRelations[]) {
        for (const appointment of appointments) {
            try {
                if (!appointment.contact || !appointment.doctor || !appointment.organization) {
                    this.logger.warn(`Skipping WhatsApp reminder for appointment ${appointment.id}: missing required relation`);
                    continue;
                }
                
                await this.whatsappService.sendAppointmentReminder(
                    appointment.contact.whatsapp || '',
                    {
                        appointmentId: appointment.id,
                        patientName: `${appointment.contact.firstName || ''} ${appointment.contact.lastName || ''}`.trim(),
                        doctorName: `Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`.trim(),
                        dateTime: appointment.startTime,
                        location: appointment.location || 'N/A',
                        organizationName: appointment.organization.name || 'N/A',
                    },
                );

                await this.markReminderSent(appointment.id);
            } catch (error) {
                this.logger.error(`Error sending WhatsApp reminder for appointment ${appointment.id}:`, error);
            }
        }
    }

    private async markReminderSent(appointmentId: string) {
        await this.appointmentRepository.update(appointmentId, {
            reminderSent: true,
            reminderSentAt: new Date(),
        });
    }

    // Cleanup old reminder records
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupOldReminders() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Using proper type casting to avoid type errors
            const whereClause = {
                startTime: LessThanOrEqual(thirtyDaysAgo),
                reminderSent: true,
            } as FindOptionsWhere<Appointment>;

            // Using update without raw SQL
            await this.appointmentRepository.update(
                whereClause,
                {
                    reminderSent: false,
                    reminderSentAt: undefined,
                },
            );
        } catch (error) {
            this.logger.error('Error cleaning up old reminders:', error);
        }
    }
}