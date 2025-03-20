// src/modules/appointments/dto/appointment-query.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsDate, IsString, IsBoolean, IsInt, Min, Max, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Assuming you have an enum for appointment status
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class AppointmentQueryDto {
  @ApiPropertyOptional({ description: 'Page number (pagination)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Doctor/Provider ID' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Provider ID (alias for doctorId)' })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Patient ID' })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: AppointmentStatus, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(AppointmentStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value].filter(Boolean)))
  status?: AppointmentStatus[];

  @ApiPropertyOptional({ description: 'Start date for range query' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for range query' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Search term for appointment title, notes, etc.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter for upcoming appointments only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  upcoming?: boolean;

  @ApiPropertyOptional({ description: 'Filter for past appointments only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  past?: boolean;

  @ApiPropertyOptional({ description: 'Filter for today\'s appointments only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  today?: boolean;

  @ApiPropertyOptional({ description: 'Sort field (e.g. startTime, createdAt)' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'startTime';

  @ApiPropertyOptional({ description: 'Sort order (ASC or DESC)' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  // This will be set by the controller
  organizationId?: string;
}