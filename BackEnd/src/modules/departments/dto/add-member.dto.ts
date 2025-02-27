import { IsNotEmpty, IsUUID, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DepartmentMemberRole {
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  MEMBER = 'MEMBER'
}

export class AddMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: DepartmentMemberRole })
  @IsNotEmpty()
  @IsEnum(DepartmentMemberRole)
  role: DepartmentMemberRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}