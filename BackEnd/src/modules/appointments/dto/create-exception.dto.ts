import { IsNotEmpty, IsUUID, IsString, IsBoolean, IsOptional, IsEnum, IsDate, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ScheduleExceptionType {
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE',
  CONFERENCE = 'CONFERENCE',
  PERSONAL = 'PERSONAL',
  OTHER = 'OTHER',
}

export class CreateExceptionDto {
  @ApiProperty({ description: 'Doctor ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ 
    description: 'Start date of the exception',
    example: '2023-06-15',
    type: String,
  })
  @IsISO8601()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ 
    description: 'End date of the exception',
    example: '2023-06-20',
    type: String,
  })
  @IsISO8601()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ 
    description: 'Start time for partial day exceptions (optional)',
    example: '09:00',
    type: String,
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ 
    description: 'End time for partial day exceptions (optional)',
    example: '12:00',
    type: String,
  })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ 
    description: 'Whether this is a full day exception',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isFullDay: boolean;

  @ApiProperty({ 
    description: 'Type of exception',
    enum: ScheduleExceptionType,
    example: ScheduleExceptionType.VACATION,
  })
  @IsEnum(ScheduleExceptionType)
  @IsNotEmpty()
  type: ScheduleExceptionType;

  @ApiPropertyOptional({ 
    description: 'Additional details or reason for the exception',
    example: 'Annual family vacation',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}