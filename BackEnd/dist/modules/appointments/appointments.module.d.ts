export declare class AppointmentsModule {
    configure(consumer: any): void;
    onModuleInit(): void;
    onModuleDestroy(): void;
}
export interface AppointmentsModuleOptions {
    reminderEnabled?: boolean;
    defaultReminderTime?: number;
    maxAppointmentsPerDay?: number;
    defaultAppointmentDuration?: number;
}
export declare class AppointmentsModuleAsync {
    static forRoot(options: AppointmentsModuleOptions): {
        module: typeof AppointmentsModule;
        providers: {
            provide: string;
            useValue: AppointmentsModuleOptions;
        }[];
    };
    static forRootAsync(options: any): {
        module: typeof AppointmentsModule;
        imports: any;
        providers: {
            provide: string;
            useFactory: any;
            inject: any;
        }[];
    };
}
export declare enum AppointmentEventTypes {
    CREATED = "appointment.created",
    UPDATED = "appointment.updated",
    CANCELLED = "appointment.cancelled",
    RESCHEDULED = "appointment.rescheduled",
    COMPLETED = "appointment.completed",
    REMINDER_SENT = "appointment.reminder.sent"
}
export * from './entities/appointment.entity';
export * from './entities/doctor-schedule.entity';
export * from './dto/create-appointment.dto';
export * from './dto/update-appointment.dto';
export * from './enums/appointment-status.enum';
export * from './enums/appointment-type.enum';
export * from './interfaces/appointment.interface';
