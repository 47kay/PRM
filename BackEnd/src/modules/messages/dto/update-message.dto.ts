// src/modules/messages/dto/update-message.dto.ts

import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { MessageStatus } from './create-message.dto';

export class UpdateMessageDto extends PartialType(
    OmitType(CreateMessageDto, ['type', 'contactId'] as const)
) {
    @IsOptional()
    @IsEnum(MessageStatus)
    status?: MessageStatus;
}