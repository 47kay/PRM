// src/modules/appointments/appointments.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Controllers
import { AppointmentsController } from './controllers/appointments.controller';
import { DoctorScheduleController } from './controllers/doctor-schedule.controller';

// Services
import { AppointmentsService } from './services/appointments.service';
import { DoctorScheduleService } from './services/doctor-schedule.service';
import { AppointmentReminderService } from './services/appointment-reminder.service';

// Entities
import { Appointment } from './entities/appointment.entity';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { AppointmentReminder } from './entities/appointment-reminder.entity';

// Jobs
import { AppointmentReminderJob } from '../../jobs/appointment-reminder.job';

// Subscribers
import { AppointmentSubscriber } from './subscribers/appointment.subscriber';

// Related modules
import { UsersModule } from '../users/users.module';
import { ContactsModule } from '../contacts/contacts.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
    imports: [
        // Register entities
        TypeOrmModule.forFeature([
            Appointment,
            DoctorSchedule,
            AppointmentReminder,
        ]),

        // Queue for appointment reminders
        BullModule.registerQueue({
            name: 'appointments',
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
            },
        }),

        // Event emitter for appointment events
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
            newListener: false,
            removeListener: false,
            maxListeners: 10,
            verboseMemoryLeak: true,
            ignoreErrors: false,
        }),

        // Related modules
        UsersModule,
        ContactsModule,
        NotificationsModule,
        EmailModule,
        SmsModule,
        WhatsappModule,
    ],
    controllers: [
        AppointmentsController,
        DoctorScheduleController,
    ],
    providers: [
        // Services
        AppointmentsService,
        DoctorScheduleService,
        AppointmentReminderService,

        // Jobs
        AppointmentReminderJob,

        // Event subscribers
        AppointmentSubscriber,
    ],
    exports: [
        AppointmentsService,
        DoctorScheduleService,
        AppointmentReminderService,
    ],
})
export class AppointmentsModule {
    // Optional: Configure module globally
    configure(consumer: any) {
        // Add middleware if needed
    }

    // Optional: Add module initialization logic
    onModuleInit() {
        // Initialize any required services
    }

    // Optional: Add cleanup logic
    onModuleDestroy() {
        // Cleanup resources
    }
}

// Optional: Dynamic module configuration
export interface AppointmentsModuleOptions {
    reminderEnabled?: boolean;
    defaultReminderTime?: number;
    maxAppointmentsPerDay?: number;
    defaultAppointmentDuration?: number;
}

// Optional: Async module configuration
export class AppointmentsModuleAsync {
    static forRoot(options: AppointmentsModuleOptions) {
        return {
            module: AppointmentsModule,
            providers: [
                {
                    provide: 'APPOINTMENTS_OPTIONS',
                    useValue: options,
                },
            ],
        };
    }

    static forRootAsync(options: any) {
        return {
            module: AppointmentsModule,
            imports: options.imports || [],
            providers: [
                {
                    provide: 'APPOINTMENTS_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
            ],
        };
    }
}

// Event types for appointment module
export enum AppointmentEventTypes {
    CREATED = 'appointment.created',
    UPDATED = 'appointment.updated',
    CANCELLED = 'appointment.cancelled',
    RESCHEDULED = 'appointment.rescheduled',
    COMPLETED = 'appointment.completed',
    REMINDER_SENT = 'appointment.reminder.sent',
}

// Export commonly used types
export * from './entities/appointment.entity';
export * from './entities/doctor-schedule.entity';
export * from './dto/create-appointment.dto';
export * from './dto/update-appointment.dto';
export * from './enums/appointment-status.enum';
export * from './enums/appointment-type.enum';
export * from './interfaces/appointment.interface';