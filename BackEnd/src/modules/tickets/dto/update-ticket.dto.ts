// src/modules/tickets/dto/update-ticket.dto.ts

import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTicketDto, TicketStatus } from './create-ticket.dto';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTicketDto extends PartialType(
    OmitType(CreateTicketDto, ['type', 'source'] as const)
) {
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    statusNote?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    resolution?: string;
}