// src/jobs/appointment-reminder.job.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, In } from 'typeorm';
import { EmailService } from '../modules/emails/email.service';
import { SmsService } from '../modules/sms/sms.service';
import { WhatsappService } from '../modules/whatsapp/whatsapp.service';
import { NotificationService } from '../modules/notifications/notification.service';
import { Appointment } from '../modules/appointments/entities/appointment.entity';
import { Contact } from '../modules/contacts/entities/contact.entity';
import { Organization } from '../modules/organizations/entities/organization.entity';

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
        private notificationService: NotificationService,
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

    private async getUpcomingAppointments(): Promise<Appointment[]> {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        return this.appointmentRepository.find({
            where: {
                startTime: LessThanOrEqual(tomorrow),
                status: 'CONFIRMED',
                reminderSent: false,
            },
            relations: ['contact', 'doctor', 'organization'],
            order: {
                startTime: 'ASC',
            },
        });
    }

    private groupAppointmentsByReminderType(appointments: Appointment[]) {
        return appointments.reduce(
            (acc, appointment) => {
                const contact = appointment.contact;
                
                if (contact.allowEmail && contact.email) {
                    acc.email.push(appointment);
                }
                if (contact.allowSMS && contact.phone) {
                    acc.sms.push(appointment);
                }
                if (contact.allowWhatsApp && contact.whatsapp) {
                    acc.whatsapp.push(appointment);
                }
                
                return acc;
            },
            { email: [], sms: [], whatsapp: [] } as Record<string, Appointment[]>,
        );
    }

    private async processEmailReminders(appointments: Appointment[]) {
        for (const appointment of appointments) {
            try {
                await this.emailService.sendAppointmentReminder(
                    appointment.contact.email,
                    {
                        appointmentId: appointment.id,
                        patientName: `${appointment.contact.firstName} ${appointment.contact.lastName}`,
                        doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                        dateTime: appointment.startTime,
                        location: appointment.location,
                        notes: appointment.notes,
                        organizationName: appointment.organization.name,
                    },
                );

                await this.markReminderSent(appointment.id);
            } catch (error) {
                this.logger.error(`Error sending email reminder for appointment ${appointment.id}:`, error);
            }
        }
    }

    private async processSmsReminders(appointments: Appointment[]) {
        for (const appointment of appointments) {
            try {
                await this.smsService.sendAppointmentReminder(
                    appointment.contact.phone,
                    {
                        appointmentId: appointment.id,
                        patientName: `${appointment.contact.firstName} ${appointment.contact.lastName}`,
                        dateTime: appointment.startTime,
                        organizationName: appointment.organization.name,
                    },
                );

                await this.markReminderSent(appointment.id);
            } catch (error) {
                this.logger.error(`Error sending SMS reminder for appointment ${appointment.id}:`, error);
            }
        }
    }

    private async processWhatsappReminders(appointments: Appointment[]) {
        for (const appointment of appointments) {
            try {
                await this.whatsappService.sendAppointmentReminder(
                    appointment.contact.whatsapp,
                    {
                        appointmentId: appointment.id,
                        patientName: `${appointment.contact.firstName} ${appointment.contact.lastName}`,
                        doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                        dateTime: appointment.startTime,
                        location: appointment.location,
                        organizationName: appointment.organization.name,
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

            await this.appointmentRepository.update(
                {
                    startTime: LessThanOrEqual(thirtyDaysAgo),
                    reminderSent: true,
                },
                {
                    reminderSent: false,
                    reminderSentAt: null,
                },
            );
        } catch (error) {
            this.logger.error('Error cleaning up old reminders:', error);
        }
    }
}