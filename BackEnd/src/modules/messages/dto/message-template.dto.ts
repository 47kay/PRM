// src/modules/messages/dto/message-template.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../enums/message-type.enum';

// This class represents variables that can be used in templates
export class TemplateVariablesDto {
  @ApiPropertyOptional({ description: 'Contact variables' })
  @IsObject()
  @IsOptional()
  contact?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Organization variables' })
  @IsObject()
  @IsOptional()
  organization?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Custom variables' })
  @IsObject()
  @IsOptional()
  custom?: Record<string, any>;
}

export class MessageTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Template description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Message type', enum: MessageType })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({ description: 'Template subject (for email)' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Template content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Template variables' })
  @ValidateNested()
  @Type(() => TemplateVariablesDto)
  @IsOptional()
  variables?: TemplateVariablesDto;

  @ApiPropertyOptional({ description: 'Is this a default template?' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Category or tag for the template' })
  @IsString()
  @IsOptional()
  category?: string;

  // These fields will be set by the service
  organizationId?: string;
  createdBy?: string;
}