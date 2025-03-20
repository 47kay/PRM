// src/modules/messages/dto/message-query.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsString, IsBoolean, IsDate, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageStatus } from '../enums/message-status.enum';
import { MessageType } from '../enums/message-type.enum';

export class MessageQueryDto {
  @ApiPropertyOptional({ description: 'Filter by message status' })
  @IsEnum(MessageStatus, { each: true })
  @IsOptional()
  status?: MessageStatus;
  startDate?: Date;
    endDate?: Date;

  @ApiPropertyOptional({ description: 'Filter by message type' })
  @IsEnum(MessageType, { each: true })
  @IsOptional()
  type?: MessageType;

  @ApiPropertyOptional({ description: 'Filter by contact ID' })
  @IsUUID()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Filter by sender ID' })
  @IsUUID()
  @IsOptional()
  senderId?: string;

  @ApiPropertyOptional({ description: 'Search messages by content' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by read status' })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'Filter messages from date', type: Date })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fromDate?: Date;

  @ApiPropertyOptional({ description: 'Filter messages to date', type: Date })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  toDate?: Date;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page for pagination', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  // This is for internal use only, not exposed in API docs
  organizationId?: string;
}