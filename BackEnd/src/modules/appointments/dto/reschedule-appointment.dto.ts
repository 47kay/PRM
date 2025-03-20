// src/modules/appointments/dto/reschedule-appointment.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID, IsString, ValidateIf, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class RescheduleAppointmentDto {
  @ApiProperty({ 
    description: 'New appointment start time',
    example: '2025-04-15T09:00:00Z' 
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid ISO date string' })
  startTime: string;

  @ApiProperty({ 
    description: 'New appointment end time',
    example: '2025-04-15T10:00:00Z' 
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid ISO date string' })
  endTime: string;

  @ApiPropertyOptional({ 
    description: 'New provider/doctor for the appointment (if changing provider)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID('4', { message: 'Provider ID must be a valid UUID' })
  providerId?: string;

  @ApiPropertyOptional({ 
    description: 'Reason for rescheduling',
    example: 'Doctor availability changed' 
  })
  @IsOptional()
  @IsString({ message: 'Reschedule reason must be a string' })
  reason?: string;

  @ApiPropertyOptional({ 
    description: 'Whether to notify the patient about the reschedule',
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Notify patient must be a boolean value' })
  @Type(() => Boolean)
  notifyPatient?: boolean = true;

  @ApiPropertyOptional({ 
    description: 'Custom notification message to send to the patient',
    example: 'Your appointment has been rescheduled due to unforeseen circumstances.'
  })
  @IsOptional()
  @ValidateIf(o => o.notifyPatient === true)
  @IsString({ message: 'Notification message must be a string' })
  notificationMessage?: string;

  @ApiPropertyOptional({ 
    description: 'Whether patient confirmation is required for the rescheduled appointment',
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: 'Require confirmation must be a boolean value' })
  @Type(() => Boolean)
  requireConfirmation?: boolean = false;

  // These fields will be set by the controller
  organizationId?: string;
  updatedBy?: string;
}