// src/modules/appointments/dto/create-appointment.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsUUID,
    IsDateString,
    IsString,
    IsOptional,
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

export class CreateAppointmentDto {
    @ApiProperty({ description: 'Patient/Contact ID' })
    @IsNotEmpty()
    @IsUUID()
    patientId: string;
    isRecurring?: boolean;
    recurrencePattern?: any; // Add the recurrencePattern property

    @ApiProperty({ description: 'Doctor ID' })
    @IsNotEmpty()
    @IsUUID()
    doctorId: string;

    @ApiProperty({ description: 'Appointment start time', example: '2024-02-10T10:00:00Z' })
    @IsNotEmpty()
    @IsDateString()
    startTime: string;

    @ApiProperty({ description: 'Appointment end time', example: '2024-02-10T11:00:00Z' })
    @IsNotEmpty()
    @IsDateString()
    endTime: string;

    @ApiProperty({ enum: AppointmentType, description: 'Type of appointment' })
    @IsNotEmpty()
    @IsEnum(AppointmentType)
    type: AppointmentType;

    @ApiPropertyOptional({ enum: AppointmentPriority, description: 'Priority of appointment' })
    @IsOptional()
    @IsEnum(AppointmentPriority)
    priority?: AppointmentPriority;

    @ApiProperty({ description: 'Title/Subject of appointment' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    title: string;

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
    @Type(() => ReminderPreferencesDto)
    reminderPreferences?: ReminderPreferencesDto;

    @ApiPropertyOptional({ description: 'Custom form data for appointment' })
    @IsOptional()
    @Type(() => AppointmentFormDataDto)
    formData?: AppointmentFormDataDto;

    @ApiPropertyOptional({ description: 'Additional metadata for appointment' })
    @IsOptional()
    @Type(() => AppointmentMetadataDto)
    metadata?: AppointmentMetadataDto;
}

class ReminderPreferencesDto {
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

class AppointmentFormDataDto {
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
}

class AppointmentMetadataDto {
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
}