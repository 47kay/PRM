import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Appointment } from '../entities/appointment.entity';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { NotificationService } from '../../notifications/services/notification.service';
import { EmailService } from '../../email/services/email.service';
import { DoctorScheduleService } from './doctor-schedule.service';
export declare class AppointmentsService {
    private appointmentRepository;
    private userRepository;
    private contactRepository;
    private configService;
    private notificationService;
    private emailService;
    private doctorScheduleService;
    private eventEmitter;
    constructor(appointmentRepository: Repository<Appointment>, userRepository: Repository<User>, contactRepository: Repository<Contact>, configService: ConfigService, notificationService: NotificationService, emailService: EmailService, doctorScheduleService: DoctorScheduleService, eventEmitter: EventEmitter2);
    create(createAppointmentDto: CreateAppointmentDto & {
        organizationId: string;
        createdBy: string;
    }): Promise<Appointment>;
    findAll(query: {
        organizationId: string;
        startDate?: Date;
        endDate?: Date;
        doctorId?: string;
        patientId?: string;
        status?: AppointmentStatus[];
        page?: number;
        limit?: number;
    }): Promise<{
        data: Appointment[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, organizationId: string): Promise<Appointment>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto & {
        organizationId: string;
        updatedBy: string;
    }): Promise<Appointment>;
    cancel(id: string, data: {
        reason: string;
        organizationId: string;
        updatedBy: string;
    }): Promise<Appointment>;
    reschedule(id: string, data: {
        startTime: Date;
        endTime: Date;
        reason: string;
        organizationId: string;
        updatedBy: string;
    }): Promise<Appointment>;
    complete(id: string, data: {
        organizationId: string;
        updatedBy: string;
    }): Promise<Appointment>;
    private checkConflicts;
    private createRecurringAppointments;
    private sendAppointmentNotifications;
    getStatistics(query: {
        organizationId: string;
        startDate: Date;
        endDate: Date;
        doctorId?: string;
    }): Promise<void>;
}
