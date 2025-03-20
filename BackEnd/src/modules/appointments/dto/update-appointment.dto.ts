// src/modules/appointments/dto/update-appointment.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsUUID,
    IsDateString,
    IsString,
    IsEnum,
    IsBoolean,
    ValidateIf,
    MinLength,
    MaxLength,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentType } from '../enums/appointment-type.enum';
import { AppointmentPriority } from '../enums/appointment-priority.enum';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class UpdateAppointmentDto {
    @ApiPropertyOptional({ description: 'Doctor ID' })
    @IsOptional()
    @IsUUID()
    doctorId?: string;

    @ApiPropertyOptional({ description: 'Appointment start time' })
    @IsOptional()
    @IsDateString()
    startTime?: string;

    @ApiPropertyOptional({ description: 'Appointment end time' })
    @IsOptional()
    @IsDateString()
    endTime?: string;

    @ApiPropertyOptional({ enum: AppointmentType, description: 'Type of appointment' })
    @IsOptional()
    @IsEnum(AppointmentType)
    type?: AppointmentType;

    @ApiPropertyOptional({ enum: AppointmentPriority, description: 'Priority of appointment' })
    @IsOptional()
    @IsEnum(AppointmentPriority)
    priority?: AppointmentPriority;

    @ApiPropertyOptional({ enum: AppointmentStatus, description: 'Status of appointment' })
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    @ApiPropertyOptional({ description: 'Title/Subject of appointment' })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    title?: string;

    @ApiPropertyOptional({ description: 'Detailed description of appointment' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional({ description: 'Location of appointment' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    location?: string;

    @ApiPropertyOptional({ description: 'Meeting link for virtual appointments' })
    @IsOptional()
    @ValidateIf(o => o.type === AppointmentType.VIRTUAL)
    @IsString()
    @MaxLength(500)
    meetingLink?: string;

    @ApiPropertyOptional({ description: 'Whether to send reminders' })
    @IsOptional()
    @IsBoolean()
    sendReminders?: boolean;

    @ApiPropertyOptional({ description: 'Reminder preferences' })
    @IsOptional()
    @Type(() => UpdateReminderPreferencesDto)
    reminderPreferences?: UpdateReminderPreferencesDto;

    @ApiPropertyOptional({ description: 'Custom form data for appointment' })
    @IsOptional()
    @Type(() => UpdateAppointmentFormDataDto)
    formData?: UpdateAppointmentFormDataDto;

    @ApiPropertyOptional({ description: 'Additional metadata for appointment' })
    @IsOptional()
    @Type(() => UpdateAppointmentMetadataDto)
    metadata?: UpdateAppointmentMetadataDto;

    @ApiPropertyOptional({ description: 'Cancellation reason' })
    @IsOptional()
    @ValidateIf(o => o.status === AppointmentStatus.CANCELLED)
    @IsString()
    @MinLength(3)
    @MaxLength(500)
    cancellationReason?: string;

    @ApiPropertyOptional({ description: 'Rescheduling reason' })
    @IsOptional()
    @ValidateIf(o => o.status === AppointmentStatus.RESCHEDULED)
    @IsString()
    @MinLength(3)
    @MaxLength(500)
    reschedulingReason?: string;
}

export class UpdateReminderPreferencesDto {
    @ApiPropertyOptional({ description: 'Send email reminders' })
    @IsOptional()
    @IsBoolean()
    email?: boolean;

    @ApiPropertyOptional({ description: 'Send SMS reminders' })
    @IsOptional()
    @IsBoolean()
    sms?: boolean;

    @ApiPropertyOptional({ description: 'Send WhatsApp reminders' })
    @IsOptional()
    @IsBoolean()
    whatsapp?: boolean;

    @ApiPropertyOptional({ description: 'Reminder times in minutes before appointment' })
    @IsOptional()
    @IsArray()
    @Type(() => Number)
    reminderTimes?: number[];
}

export class UpdateAppointmentFormDataDto {
    @ApiPropertyOptional({ description: 'Chief complaint' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    chiefComplaint?: string;

    @ApiPropertyOptional({ description: 'Symptoms' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    symptoms?: string[];

    @ApiPropertyOptional({ description: 'Duration of symptoms' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    duration?: string;

    @ApiPropertyOptional({ description: 'Additional notes' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;

    @ApiPropertyOptional({ description: 'Diagnosis' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    diagnosis?: string;

    @ApiPropertyOptional({ description: 'Treatment plan' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    treatmentPlan?: string;

    @ApiPropertyOptional({ description: 'Prescribed medications' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    prescriptions?: string[];

    @ApiPropertyOptional({ description: 'Follow-up instructions' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    followUpInstructions?: string;
}

export class UpdateAppointmentMetadataDto {
    @ApiPropertyOptional({ description: 'Referral source' })
    @IsOptional()
    @IsString()
    referralSource?: string;

    @ApiPropertyOptional({ description: 'Insurance information' })
    @IsOptional()
    @IsString()
    insurance?: string;

    @ApiPropertyOptional({ description: 'Custom tags' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ description: 'External reference ID' })
    @IsOptional()
    @IsString()
    externalId?: string;

    @ApiPropertyOptional({ description: 'Follow-up appointment ID' })
    @IsOptional()
    @IsUUID()
    followUpAppointmentId?: string;

    @ApiPropertyOptional({ description: 'Previous appointment ID' })
    @IsOptional()
    @IsUUID()
    previousAppointmentId?: string;

    @ApiPropertyOptional({ description: 'Billing status' })
    @IsOptional()
    @IsString()
    billingStatus?: string;

    @ApiPropertyOptional({ description: 'Insurance claim status' })
    @IsOptional()
    @IsString()
    claimStatus?: string;
}