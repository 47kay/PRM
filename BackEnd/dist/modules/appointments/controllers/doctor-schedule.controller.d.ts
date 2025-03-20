import { DoctorScheduleService } from '../services/doctor-schedule.service';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';
import { CreateExceptionDto } from '../dto/create-exception.dto';
import { CustomRequest } from '../../../interfaces/request.interface';
import { DoctorSchedule } from '../entities/doctor-schedule.entity';
import { ScheduleException } from '../entities/schedule-exception.entity';
export declare class DoctorScheduleController {
    private readonly doctorScheduleService;
    constructor(doctorScheduleService: DoctorScheduleService);
    create(createScheduleDto: CreateScheduleDto, req: CustomRequest): Promise<DoctorSchedule>;
    getDoctorSchedules(doctorId: string, req: CustomRequest): Promise<DoctorSchedule[]>;
    getScheduleForDate(doctorId: string, dateString: string, req: CustomRequest): Promise<DoctorSchedule>;
    update(id: string, updateScheduleDto: UpdateScheduleDto, req: CustomRequest): Promise<DoctorSchedule>;
    remove(id: string, req: CustomRequest): Promise<void>;
    private getScheduleById;
    createException(createExceptionDto: CreateExceptionDto, req: CustomRequest): Promise<ScheduleException>;
    getDoctorExceptions(doctorId: string, req: CustomRequest): Promise<ScheduleException[]>;
    removeException(id: string, req: CustomRequest): Promise<void>;
    checkAvailability(doctorId: string, startTimeString: string, endTimeString: string, req: CustomRequest): Promise<{
        available: boolean;
    }>;
}
