// src/modules/messages/dto/bulk-message.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';
import { IsNotEmpty, IsString, IsArray, IsUUID, IsOptional, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../enums/message-type.enum';

// Optionally define attachment info if your system supports attachments
export class AttachmentDto {
  @ApiProperty({ description: 'Attachment filename' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'Attachment content type' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ description: 'Attachment URL or content ID' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class BulkMessageDto {
  @ApiProperty({ description: 'Array of contact IDs to send messages to', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  contactIds: string[];
  messageData: CreateMessageDto;

  @ApiProperty({ description: 'Message sender ID' })
  @ApiProperty({ description: 'Message subject (for email)', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Message content body' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Type of message', enum: MessageType })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiPropertyOptional({ description: 'Template ID to use', required: false })
  @IsUUID('4')
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Template variables', required: false })
  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Message attachments', type: [AttachmentDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @ApiPropertyOptional({ description: 'Schedule message for a later time', required: false })
  @IsString()
  @IsOptional()
  scheduledFor?: string;

  // These fields will be set by the service
  organizationId?: string;
  senderId?: string;


  
}