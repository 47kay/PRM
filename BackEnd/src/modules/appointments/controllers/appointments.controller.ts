// src/modules/appointments/services/appointments.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Appointment } from '../entities/appointment.entity';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { EmailService } from '../../email/services/email.service';
import { DoctorScheduleService } from '../services/doctor-schedule.service';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectRepository(Appointment)
        private appointmentRepository: Repository<Appointment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
        private configService: ConfigService,
        private notificationsService: NotificationsService,
        private emailService: EmailService,
        private doctorScheduleService: DoctorScheduleService,
        private eventEmitter: EventEmitter2,
    ) {}
    

    async create(createAppointmentDto: CreateAppointmentDto & { organizationId: string; createdBy: string }): Promise<Appointment> {
        // Validate doctor and patient
        const [doctor, patient] = await Promise.all([
            this.userRepository.findOne({ where: { id: createAppointmentDto.doctorId } }),
            this.contactRepository.findOne({ where: { id: createAppointmentDto.patientId } }),
        ]);

        if (!doctor) throw new NotFoundException('Doctor not found');
        if (!patient) throw new NotFoundException('Patient not found');

        // Check doctor availability
        const isAvailable = await this.doctorScheduleService.checkAvailability({
            doctorId: doctor.id,
            startTime: new Date(createAppointmentDto.startTime),
            endTime: new Date(createAppointmentDto.endTime),
        });

        if (!isAvailable) {
            throw new ConflictException('Doctor is not available at the selected time');
        }

        // Check for conflicting appointments
        await this.checkConflicts({
            doctorId: doctor.id,
            startTime: new Date(createAppointmentDto.startTime),
            endTime: new Date(createAppointmentDto.endTime),
        });
        

        // Create appointment
        const appointment = this.appointmentRepository.create({
            ...createAppointmentDto,
            startTime: new Date(createAppointmentDto.startTime),
            endTime: new Date(createAppointmentDto.endTime),
        });

        const savedAppointment = await this.appointmentRepository.save(appointment);

        // Handle recurring appointments if specified
        if ('isRecurring' in createAppointmentDto && 
            createAppointmentDto.isRecurring && 
            'recurrencePattern' in createAppointmentDto && 
            createAppointmentDto.recurrencePattern) {
            await this.createRecurringAppointments(
                savedAppointment, 
                (createAppointmentDto as any).recurrencePattern
            );
        }

        // Send notifications
        await this.sendAppointmentNotifications(savedAppointment, 'created');

        // Emit event
        this.eventEmitter.emit('appointment.created', savedAppointment);

        return savedAppointment;
    }

    async findAll(query: {
        organizationId: string;
        startDate?: Date;
        endDate?: Date;
        doctorId?: string;
        patientId?: string;
        status?: AppointmentStatus[];
        page?: number;
        limit?: number;
    }) {
        const {
            organizationId,
            startDate,
            endDate,
            doctorId,
            patientId,
            status,
            page = 1,
            limit = 10,
        } = query;

        const queryBuilder = this.appointmentRepository
            .createQueryBuilder('appointment')
            .where('appointment.organizationId = :organizationId', { organizationId });

        // Apply filters
        if (startDate && endDate) {
            queryBuilder.andWhere('appointment.startTime BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }

        if (doctorId) {
            queryBuilder.andWhere('appointment.doctorId = :doctorId', { doctorId });
        }

        if (patientId) {
            queryBuilder.andWhere('appointment.patientId = :patientId', { patientId });
        }

        if (status && status.length > 0) {
            queryBuilder.andWhere('appointment.status IN (:...status)', { status });
        }

        // Add relationships
        queryBuilder
            .leftJoinAndSelect('appointment.doctor', 'doctor')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .leftJoinAndSelect('appointment.creator', 'creator');

        // Add pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Add ordering
        queryBuilder.orderBy('appointment.startTime', 'ASC');

        const [appointments, total] = await queryBuilder.getManyAndCount();

        return {
            data: appointments,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, organizationId: string): Promise<Appointment> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id, organizationId },
            relations: ['doctor', 'patient', 'creator', 'updater'],
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        return appointment;
    }

    async update(
        id: string,
        updateAppointmentDto: UpdateAppointmentDto & { organizationId: string; updatedBy: string },
    ): Promise<Appointment> {
        const appointment = await this.findOne(id, updateAppointmentDto.organizationId);

        if (!appointment.canBeModified()) {
            throw new ForbiddenException('Appointment cannot be modified');
        }

        // Check for time conflicts if time is being updated
        if (updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
            await this.checkConflicts({
                doctorId: updateAppointmentDto.doctorId || appointment.doctorId,
                startTime: new Date(updateAppointmentDto.startTime || appointment.startTime),
                endTime: new Date(updateAppointmentDto.endTime || appointment.endTime),
                excludeAppointmentId: id,
            });
        }

        // Update appointment
        Object.assign(appointment, updateAppointmentDto);
        const savedAppointment = await this.appointmentRepository.save(appointment);

        // Send notifications
        await this.sendAppointmentNotifications(savedAppointment, 'updated');

        // Emit event
        this.eventEmitter.emit('appointment.updated', savedAppointment);

        return savedAppointment;
    }

    async cancel(
        id: string,
        data: { reason: string; organizationId: string; updatedBy: string },
    ): Promise<Appointment> {
        const appointment = await this.findOne(id, data.organizationId);
    
        if (!appointment.canBeModified()) {
            throw new ForbiddenException('Appointment cannot be cancelled');
        }
    
        // Fetch the user object
        const updater = await this.userRepository.findOne({ where: { id: data.updatedBy } });
        if (!updater) {
            throw new NotFoundException(`User with ID ${data.updatedBy} not found`);
        }
    
        appointment.status = AppointmentStatus.CANCELLED;
        appointment.cancellationReason = data.reason;
        appointment.cancelledAt = new Date();
        appointment.updatedBy = updater; // Now assigning a User object instead of string
    
        const savedAppointment = await this.appointmentRepository.save(appointment);
    
        // Send notifications
        await this.sendAppointmentNotifications(savedAppointment, 'cancelled');
    
        // Emit event
        this.eventEmitter.emit('appointment.cancelled', savedAppointment);
    
        return savedAppointment;
    }

    async reschedule(
        id: string,
        data: {
            startTime: Date;
            endTime: Date;
            reason: string;
            organizationId: string;
            updatedBy: string;
        },
    ): Promise<Appointment> {
        const appointment = await this.findOne(id, data.organizationId);
    
        if (!appointment.canBeModified()) {
            throw new ForbiddenException('Appointment cannot be rescheduled');
        }
    
        // Check doctor availability and conflicts
        await this.checkConflicts({
            doctorId: appointment.doctorId,
            startTime: data.startTime,
            endTime: data.endTime,
            excludeAppointmentId: id,
        });
    
        // Fetch the user object
        const updater = await this.userRepository.findOne({ where: { id: data.updatedBy } });
        if (!updater) {
            throw new NotFoundException(`User with ID ${data.updatedBy} not found`);
        }
    
        appointment.startTime = data.startTime;
        appointment.endTime = data.endTime;
        appointment.status = AppointmentStatus.RESCHEDULED;
        appointment.reschedulingReason = data.reason;
        appointment.updatedBy = updater; // Now assigning a User object instead of string
    
        const savedAppointment = await this.appointmentRepository.save(appointment);
    
        // Send notifications
        await this.sendAppointmentNotifications(savedAppointment, 'rescheduled');
    
        // Emit event
        this.eventEmitter.emit('appointment.rescheduled', savedAppointment);
    
        return savedAppointment;
    }



    
    async confirm(
        id: string,
        data: { organizationId: string; updatedBy: string },
    ): Promise<Appointment> {
        const appointment = await this.findOne(id, data.organizationId);
    
        if (appointment.status !== AppointmentStatus.PENDING) {
            throw new BadRequestException('Only pending appointments can be confirmed');
        }
    
        // Fetch the user object
        const updater = await this.userRepository.findOne({ where: { id: data.updatedBy } });
        if (!updater) {
            throw new NotFoundException(`User with ID ${data.updatedBy} not found`);
        }
    
        appointment.status = AppointmentStatus.CONFIRMED;
        appointment.confirmedAt = new Date();
        appointment.updatedBy = updater; // Now assigning a User object instead of string
    
        const savedAppointment = await this.appointmentRepository.save(appointment);
    
        // Send notifications
        await this.sendAppointmentNotifications(savedAppointment, 'confirmed');
    
        // Emit event
        this.eventEmitter.emit('appointment.confirmed', savedAppointment);
    
        return savedAppointment;
    }


    

    async confirmAppointment(
        id: string,
        data: { organizationId: string; updatedBy: string },
    ): Promise<Appointment> {
        return this.confirm(id, data);
    }

    async complete(
        id: string,
        data: { organizationId: string; updatedBy: string },
    ): Promise<Appointment> {
        const appointment = await this.findOne(id, data.organizationId);
    
        if (appointment.status !== AppointmentStatus.CONFIRMED) {
            throw new BadRequestException('Only confirmed appointments can be completed');
        }
    
        // Fetch the user object
        const updater = await this.userRepository.findOne({ where: { id: data.updatedBy } });
        if (!updater) {
            throw new NotFoundException(`User with ID ${data.updatedBy} not found`);
        }
    
        appointment.status = AppointmentStatus.COMPLETED;
        appointment.completedAt = new Date();
        appointment.updatedBy = updater; // Now assigning a User object instead of string
    
        const savedAppointment = await this.appointmentRepository.save(appointment);
    
        // Send notifications
        await this.sendAppointmentNotifications(savedAppointment, 'completed');
    
        // Emit event
        this.eventEmitter.emit('appointment.completed', savedAppointment);
    
        return savedAppointment;
    }

    async remove(id: string, organizationId: string): Promise<void> {
        const appointment = await this.findOne(id, organizationId);
        await this.appointmentRepository.remove(appointment);
    }

    async getCalendarEvents(query: {
        organizationId: string;
        start: Date;
        end: Date;
        doctorId?: string;
    }) {
        // Get appointments within the date range
        const whereClause: any = {
            organizationId: query.organizationId,
            startTime: MoreThanOrEqual(query.start),
            endTime: LessThanOrEqual(query.end),
        };

        // Add doctorId filter if provided
        if (query.doctorId) {
            whereClause.doctorId = query.doctorId;
        }

        const appointments = await this.appointmentRepository.find({
            where: whereClause,
            relations: ['doctor', 'patient'],
        });

        // Map appointments to calendar format
        return appointments.map(appointment => ({
            id: appointment.id,
            title: `Appointment with ${appointment.patient?.fullName || 'Patient'}`,
            start: appointment.startTime,
            end: appointment.endTime,
            status: appointment.status,
            doctor: appointment.doctor ? {
                id: appointment.doctor.id,
                name: appointment.doctor.fullName || `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            } : null,
            patient: appointment.patient ? {
                id: appointment.patient.id,
                name: appointment.patient.fullName || `${appointment.patient.firstName} ${appointment.patient.lastName}`,
            } : null,
        }));
    }

    async findAvailableSlots(query: {
        doctorId: string;
        date: Date;
        organizationId: string;
    }) {
        // Get doctor's schedule for that day
        const schedule = await this.doctorScheduleService.getDoctorScheduleForDate(
            query.doctorId,
            query.date,
            query.organizationId,
        );

        if (!schedule) {
            return []; // No schedule found for that day
        }

        // Set start and end of day for querying appointments
        const startOfDay = new Date(query.date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(query.date);
        endOfDay.setHours(23, 59, 59, 999);

        // Get booked appointments for that day
        const bookedAppointments = await this.appointmentRepository.find({
            where: {
                doctorId: query.doctorId,
                organizationId: query.organizationId,
                startTime: Between(startOfDay, endOfDay),
                status: In([
                    AppointmentStatus.PENDING,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.RESCHEDULED,
                ]),
            },
        });

        // Convert booked appointments to time slots
        const bookedSlots = bookedAppointments.map(appointment => ({
            start: appointment.startTime,
            end: appointment.endTime,
        }));

        // Calculate available slots based on the doctor's schedule and booked appointments
        // This is a simplified version - you might want to implement a more sophisticated algorithm
        const slotDuration = 30; // minutes
        const slots = [];
        
        // Get start and end times from schedule
        const workStart = new Date(query.date);
        workStart.setHours(
            schedule.workStart.getHours(), 
            schedule.workStart.getMinutes(), 
            0, 0
        );
        
        const workEnd = new Date(query.date);
        workEnd.setHours(
            schedule.workEnd.getHours(), 
            schedule.workEnd.getMinutes(), 
            0, 0
        );
        
        // Create slots
        let currentSlot = new Date(workStart);
        
        while (currentSlot < workEnd) {
            const slotEnd = new Date(currentSlot);
            slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);
            
            // Check if this slot overlaps with any booked appointment
            const isBooked = bookedSlots.some(bookedSlot => 
                currentSlot < bookedSlot.end && slotEnd > bookedSlot.start
            );
            
            // Add the slot to the result
            slots.push({
                start: currentSlot.toTimeString().substring(0, 5), // Format as "HH:MM"
                end: slotEnd.toTimeString().substring(0, 5),
                available: !isBooked
            });
            
            // Move to next slot
            currentSlot = new Date(slotEnd);
        }
        
        return slots;
    }

    private async checkConflicts(data: {
        doctorId: string;
        startTime: Date;
        endTime: Date;
        excludeAppointmentId?: string;
    }) {
        const queryBuilder = this.appointmentRepository
            .createQueryBuilder('appointment')
            .where('appointment.doctorId = :doctorId', { doctorId: data.doctorId })
            .andWhere('appointment.status NOT IN (:...excludeStatuses)', {
                excludeStatuses: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED],
            })
            .andWhere(
                '(appointment.startTime, appointment.endTime) OVERLAPS (:startTime, :endTime)',
                {
                    startTime: data.startTime,
                    endTime: data.endTime,
                },
            );

        if (data.excludeAppointmentId) {
            queryBuilder.andWhere('appointment.id != :excludeId', {
                excludeId: data.excludeAppointmentId,
            });
        }

        const conflictingAppointment = await queryBuilder.getOne();

        if (conflictingAppointment) {
            throw new ConflictException('Time slot conflicts with another appointment');
        }
    }

    private async createRecurringAppointments(
        parentAppointment: Appointment,
        recurrencePattern: any,
    ) {
        // Implementation for creating recurring appointments
        // This would create future appointments based on the recurrence pattern
    }

    private async sendAppointmentNotifications(
        appointment: Appointment,
        action: 'created' | 'updated' | 'cancelled' | 'rescheduled' | 'completed' | 'confirmed',
    ) {
        // Send notifications to relevant parties (doctor, patient, staff)
        // This would use the notification service to send emails, SMS, etc.
    }

    async getStatistics(query: {
        organizationId: string;
        startDate: Date;
        endDate: Date;
        doctorId?: string;
    }) {
        // Implementation for getting appointment statistics
        // This would return metrics like total appointments, completion rate, etc.
    }
    
}