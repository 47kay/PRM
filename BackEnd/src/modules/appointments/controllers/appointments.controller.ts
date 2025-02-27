// src/modules/appointments/controllers/appointments.controller.ts

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
    ParseUUIDPipe,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AppointmentsService } from '../services/appointments.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { AppointmentQueryDto } from '../dto/appointment-query.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../users/enums/role.enum';
import { Appointment } from '../entities/appointment.entity';
import { CustomRequest } from '../../../interfaces/request.interface';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @Post()
    @Roles(Role.ADMIN, Role.DOCTOR, Role.STAFF)
    @ApiOperation({ summary: 'Create new appointment' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Appointment created successfully' })
    async create(
        @Body() createAppointmentDto: CreateAppointmentDto,
        @Request() req: CustomRequest,
    ): Promise<Appointment> {
        return this.appointmentsService.create({
            ...createAppointmentDto,
            organizationId: req.organization.id,
            createdBy: req.user.id,
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get all appointments' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return all appointments' })
    async findAll(
        @Query() query: AppointmentQueryDto,
        @Request() req: CustomRequest,
    ): Promise<{ data: Appointment[]; total: number }> {
        return this.appointmentsService.findAll({
            ...query,
            organizationId: req.organization.id,
        });
    }

    @Get('calendar')
    @ApiOperation({ summary: 'Get appointments in calendar format' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return appointments for calendar' })
    async getCalendar(
        @Query('start') start: Date,
        @Query('end') end: Date,
        @Query('doctorId') doctorId?: string,
        @Request() req: CustomRequest,
    ) {
        return this.appointmentsService.getCalendarEvents({
            start,
            end,
            doctorId,
            organizationId: req.organization.id,
        });
    }

    @Get('doctor/:doctorId')
    @ApiOperation({ summary: 'Get doctor appointments' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return doctor appointments' })
    async getDoctorAppointments(
        @Param('doctorId', ParseUUIDPipe) doctorId: string,
        @Query() query: AppointmentQueryDto,
        @Request() req: CustomRequest,
    ) {
        return this.appointmentsService.findAll({
            ...query,
            doctorId,
            organizationId: req.organization.id,
        });
    }

    @Get('patient/:patientId')
    @ApiOperation({ summary: 'Get patient appointments' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return patient appointments' })
    async getPatientAppointments(
        @Param('patientId', ParseUUIDPipe) patientId: string,
        @Query() query: AppointmentQueryDto,
        @Request() req: CustomRequest,
    ) {
        return this.appointmentsService.findAll({
            ...query,
            patientId,
            organizationId: req.organization.id,
        });
    }

    @Get('available-slots')
    @ApiOperation({ summary: 'Get available appointment slots' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return available slots' })
    async getAvailableSlots(
        @Query('doctorId', ParseUUIDPipe) doctorId: string,
        @Query('date') date: Date,
        @Request() req: CustomRequest,
    ) {
        return this.appointmentsService.getAvailableSlots({
            doctorId,
            date,
            organizationId: req.organization.id,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get appointment by id' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return appointment' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ): Promise<Appointment> {
        return this.appointmentsService.findOne(id, req.organization.id);
    }

    @Put(':id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.STAFF)
    @ApiOperation({ summary: 'Update appointment' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Appointment updated successfully' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateAppointmentDto: UpdateAppointmentDto,
        @Request() req: CustomRequest,
    ): Promise<Appointment> {
        return this.appointmentsService.update(id, {
            ...updateAppointmentDto,
            organizationId: req.organization.id,
            updatedBy: req.user.id,
        });
    }

    @Put(':id/reschedule')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.STAFF)
    @ApiOperation({ summary: 'Reschedule appointment' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Appointment rescheduled successfully' })
    async reschedule(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() rescheduleDto: RescheduleAppointmentDto,
        @Request() req: CustomRequest,
    ): Promise<Appointment> {
        return this.appointmentsService.reschedule(id, {
            ...rescheduleDto,
            organizationId: req.organization.id,
            updatedBy: req.user.id,
        });
    }

    @Put(':id/confirm')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.STAFF)
    @ApiOperation({ summary: 'Confirm appointment' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Appointment confirmed successfully' })
    async confirm(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ): Promise<Appointment> {
        return this.appointmentsService.confirm(id, {
            organizationId: req.organization.id,
            updatedBy: req.user.id,
        });
    }

    @Put(':id/cancel')
    @ApiOperation({ summary: 'Cancel appointment' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Appointment cancelled successfully' })
    async cancel(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('reason') reason: string,
        @Request() req: CustomRequest,
    ): Promise<Appointment> {
        return this.appointmentsService.cancel(id, {
            reason,
            organizationId: req.organization.id,
            updatedBy: req.user.id,
        });
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete appointment' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Appointment deleted successfully' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ): Promise<void> {
        await this.appointmentsService.remove(id, req.organization.id);
    }

    @Get('statistics/summary')
    @Roles(Role.ADMIN, Role.DOCTOR)
    @ApiOperation({ summary: 'Get appointments statistics' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return appointments statistics' })
    async getStatistics(
        @Query('startDate') startDate: Date,
        @Query('endDate') endDate: Date,
        @Query('doctorId') doctorId?: string,
        @Request() req: CustomRequest,
    ) {
        return this.appointmentsService.getStatistics({
            startDate,
            endDate,
            doctorId,
            organizationId: req.organization.id,
        });
    }
}