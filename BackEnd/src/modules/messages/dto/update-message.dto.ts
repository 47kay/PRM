// src/modules/messages/dto/update-message.dto.ts

import { PartialType, OmitType, ApiPropertyOptional} from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';
import { MessageStatus } from './create-message.dto';
import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateMessageDto extends PartialType(
    OmitType(CreateMessageDto, ['type', 'contactId'] as const)
) {
    @ApiPropertyOptional({ enum: MessageStatus })
    @IsOptional()
    @IsEnum(MessageStatus)
    status?: MessageStatus;

    // Explicitly add subject even though it should be inherited
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    subject?: string;

    // Explicitly add metadata even though it should be inherited
    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}