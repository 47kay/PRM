// src/modules/tickets/dto/create-ticket.dto.ts

import {
    IsString,
    IsEnum,
    IsUUID,
    IsOptional,
    IsArray,
    ValidateNested,
    IsBoolean,
    MaxLength,
    MinLength,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TicketType {
    GENERAL = 'GENERAL',
    TECHNICAL = 'TECHNICAL',
    BILLING = 'BILLING',
    MEDICAL = 'MEDICAL',
    APPOINTMENT = 'APPOINTMENT',
    ACCESS = 'ACCESS',
    COMPLAINT = 'COMPLAINT',
    FEEDBACK = 'FEEDBACK',
}

export enum TicketPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    PENDING = 'PENDING',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
    ESCALATED = 'ESCALATED',
    REOPENED = 'REOPENED',
    DELETED = 'DELETED',
}


export enum TicketSource {
    WEB = 'WEB',
    MOBILE = 'MOBILE',
    EMAIL = 'EMAIL',
    PHONE = 'PHONE',
    CHAT = 'CHAT',
    SYSTEM = 'SYSTEM',
}

export class TicketAttachment {
    @ApiProperty()
    @IsString()
    @MaxLength(255)
    fileName: string;

    @ApiProperty()
    @IsString()
    @MaxLength(50)
    fileType: string;

    @ApiProperty()
    @IsString()
    fileUrl: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fileSize?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}

export class CreateTicketDto {
    @ApiProperty()
    @IsString()
    @MinLength(5)
    @MaxLength(200)
    title: string;

    @ApiProperty()
    @IsString()
    @MinLength(10)
    @MaxLength(5000)
    description: string;

    @ApiProperty({ enum: TicketType })
    @IsEnum(TicketType)
    type: TicketType;

    @ApiPropertyOptional({ enum: TicketPriority })
    @IsOptional()
    @IsEnum(TicketPriority)
    priority?: TicketPriority = TicketPriority.NORMAL;

    @ApiPropertyOptional({ enum: TicketSource })
    @IsOptional()
    @IsEnum(TicketSource)
    source?: TicketSource = TicketSource.WEB;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    contactId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    departmentId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    assigneeId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    subCategory?: string;

    @ApiPropertyOptional({ type: [TicketAttachment] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TicketAttachment)
    attachments?: TicketAttachment[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    referenceNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    relatedTicketId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    customFields?: {
        patientId?: string;
        appointmentId?: string;
        medicalRecordId?: string;
        insuranceInfo?: {
            provider?: string;
            policyNumber?: string;
        };
        deviceInfo?: {
            type?: string;
            model?: string;
            serialNumber?: string;
        };
        [key: string]: any;
    };

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPrivate?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    internalNotes?: string;
}