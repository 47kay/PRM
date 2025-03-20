// src/modules/contacts/dto/merge-contacts.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsUUID,
    IsArray,
    IsOptional,
    IsEmail,
    IsPhoneNumber,
    IsDate,
    IsEnum,
    IsBoolean,
    MinLength,
    MaxLength,
    ValidateNested,
    IsUrl,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';
import { UpdateContactAddressDto, UpdateEmergencyContactDto, UpdateMedicalInfoDto, UpdateInsuranceInfoDto, UpdateCommunicationPrefsDto } from './update-contact.dto';

export class MergeContactsDto {
    @ApiProperty({ description: 'Primary contact ID that will be kept' })
    @IsNotEmpty()
    @IsUUID()
    primaryContactId: string;
    secondaryContactId: string;

    @ApiProperty({ description: 'Secondary contact IDs that will be merged into the primary contact', type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMinSize(1)
    secondaryContactIds: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsPhoneNumber()
    whatsapp?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dateOfBirth?: Date;

    @ApiPropertyOptional({ enum: Gender })
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @ApiPropertyOptional({ enum: MaritalStatus })
    @IsOptional()
    @IsEnum(MaritalStatus)
    maritalStatus?: MaritalStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateContactAddressDto)
    address?: UpdateContactAddressDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateEmergencyContactDto)
    emergencyContact?: UpdateEmergencyContactDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateMedicalInfoDto)
    medicalInfo?: UpdateMedicalInfoDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateInsuranceInfoDto)
    insuranceInfo?: UpdateInsuranceInfoDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateCommunicationPrefsDto)
    communicationPrefs?: UpdateCommunicationPrefsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl({}, { each: true })
    @IsArray()
    documents?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    groups?: string[];

    @ApiPropertyOptional({ description: 'Whether to keep the history of the merged contacts' })
    @IsOptional()
    @IsBoolean()
    keepHistory?: boolean;

    @ApiPropertyOptional({ description: 'Whether to delete the secondary contacts after merging' })
    @IsOptional()
    @IsBoolean()
    deleteSecondaryContacts?: boolean;
}

export class MergeContactsResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    mergedContactIds: string[];
    mergedAt: Date;
    mergedBy: string;
}