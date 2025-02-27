import { AppointmentsService } from '../services/appointments.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { AppointmentQueryDto } from '../dto/appointment-query.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { CustomRequest } from '../../../interfaces/request.interface';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: CreateAppointmentDto, req: CustomRequest): Promise<Appointment>;
    findAll(query: AppointmentQueryDto, req: CustomRequest): Promise<{
        data: Appointment[];
        total: number;
    }>;
    getCalendar(start: Date, end: Date, doctorId?: string, req: CustomRequest): Promise<any>;
    getDoctorAppointments(doctorId: string, query: AppointmentQueryDto, req: CustomRequest): Promise<{
        data: Appointment[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPatientAppointments(patientId: string, query: AppointmentQueryDto, req: CustomRequest): Promise<{
        data: Appointment[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAvailableSlots(doctorId: string, date: Date, req: CustomRequest): Promise<any>;
    findOne(id: string, req: CustomRequest): Promise<Appointment>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto, req: CustomRequest): Promise<Appointment>;
    reschedule(id: string, rescheduleDto: RescheduleAppointmentDto, req: CustomRequest): Promise<Appointment>;
    confirm(id: string, req: CustomRequest): Promise<Appointment>;
    cancel(id: string, reason: string, req: CustomRequest): Promise<Appointment>;
    remove(id: string, req: CustomRequest): Promise<void>;
    getStatistics(startDate: Date, endDate: Date, doctorId?: string, req: CustomRequest): Promise<void>;
}
