import { IsInt, IsString, IsBoolean, IsOptional, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleDto } from './create-schedule.dto';

// For settings, we can reuse the structure from CreateScheduleDto
class ScheduleSettingsDto {
  @ApiPropertyOptional({ description: 'Minimum appointment duration in minutes', example: 15 })
  @IsInt()
  @Min(5)
  @IsOptional()
  minAppointmentDuration?: number;

  @ApiPropertyOptional({ description: 'Appointment buffer time in minutes', example: 5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  appointmentBuffer?: number;

  @ApiPropertyOptional({ description: 'Max appointments per day', example: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxAppointmentsPerDay?: number;

  @ApiPropertyOptional({ description: 'Preferred appointment duration in minutes', example: 30 })
  @IsInt()
  @Min(5)
  @IsOptional()
  preferredDuration?: number;

  @ApiPropertyOptional({ description: 'Whether to allow online booking', example: true })
  @IsBoolean()
  @IsOptional()
  allowOnlineBooking?: boolean;

  @ApiPropertyOptional({ description: 'How many days in advance appointment can be booked', example: 30 })
  @IsInt()
  @Min(1)
  @IsOptional()
  advanceBookingDays?: number;
}

// Make all fields optional for updates
export class UpdateScheduleDto {
  @ApiPropertyOptional({ description: 'Day of week (0=Sunday, 1=Monday, etc.)', example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  dayOfWeek?: number;

  @ApiPropertyOptional({ description: 'Work start time', example: '09:00' })
  @IsString()
  @IsOptional()
  workStart?: string;

  @ApiPropertyOptional({ description: 'Work end time', example: '17:00' })
  @IsString()
  @IsOptional()
  workEnd?: string;

  @ApiPropertyOptional({ description: 'Break start time', example: '12:00' })
  @IsString()
  @IsOptional()
  breakStart?: string;

  @ApiPropertyOptional({ description: 'Break end time', example: '13:00' })
  @IsString()
  @IsOptional()
  breakEnd?: string;

  @ApiPropertyOptional({ description: 'Default appointment duration in minutes', example: 30 })
  @IsInt()
  @Min(5)
  @IsOptional()
  defaultAppointmentDuration?: number;

  @ApiPropertyOptional({ description: 'Is this schedule active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional schedule settings', type: ScheduleSettingsDto })
  @ValidateNested()
  @Type(() => ScheduleSettingsDto)
  @IsOptional()
  settings?: ScheduleSettingsDto;
}