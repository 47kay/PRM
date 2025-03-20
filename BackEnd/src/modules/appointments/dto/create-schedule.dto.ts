import { IsNotEmpty, IsUUID, IsInt, IsString, IsBoolean, IsOptional, Min, Max, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class CreateScheduleDto {
  @ApiProperty({ description: 'Doctor ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ description: 'Day of week (0=Sunday, 1=Monday, etc.)', example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  dayOfWeek: number;

  @ApiProperty({ description: 'Work start time', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  workStart: string;

  @ApiProperty({ description: 'Work end time', example: '17:00' })
  @IsString()
  @IsNotEmpty()
  workEnd: string;

  @ApiPropertyOptional({ description: 'Break start time', example: '12:00' })
  @IsString()
  @IsOptional()
  breakStart?: string;

  @ApiPropertyOptional({ description: 'Break end time', example: '13:00' })
  @IsString()
  @IsOptional()
  breakEnd?: string;

  @ApiProperty({ description: 'Default appointment duration in minutes', example: 30 })
  @IsInt()
  @Min(5)
  @IsNotEmpty()
  defaultAppointmentDuration: number;

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