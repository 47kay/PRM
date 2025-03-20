import { Repository, FindOperator } from 'typeorm';
import { DoctorSchedule } from '../entities/doctor-schedule.entity';
import { ScheduleException } from '../entities/schedule-exception.entity';
declare function MoreThanOrEqual(date: Date): FindOperator<Date>;
export declare class DoctorScheduleService {
    private doctorScheduleRepository;
    private scheduleExceptionRepository;
    constructor(doctorScheduleRepository: Repository<DoctorSchedule>, scheduleExceptionRepository: Repository<ScheduleException>);
    checkAvailability(data: {
        doctorId: string;
        startTime: Date;
        endTime: Date;
    }): Promise<boolean>;
    getDoctorScheduleForDate(doctorId: string, date: Date, organizationId: string): Promise<DoctorSchedule | null>;
    getDoctorSchedules(doctorId: string, organizationId: string): Promise<DoctorSchedule[]>;
    createOrUpdateSchedule(scheduleData: Partial<DoctorSchedule>): Promise<DoctorSchedule>;
    createException(exceptionData: Partial<ScheduleException>): Promise<ScheduleException>;
    deleteException(id: string, organizationId: string): Promise<void>;
    getDoctorExceptions(doctorId: string, organizationId: string): Promise<ScheduleException[]>;
}
export { MoreThanOrEqual };
