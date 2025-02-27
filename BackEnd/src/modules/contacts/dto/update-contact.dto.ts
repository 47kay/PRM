// src/modules/contacts/dto/update-contact.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsEmail,
    IsPhoneNumber,
    IsDate,
    IsEnum,
    IsBoolean,
    MinLength,
    MaxLength,
    ValidateNested,
    IsArray,
    IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';
import { BloodGroup } from '../enums/blood-group.enum';

export class UpdateContactAddressDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    street: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    street2?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    city: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    state: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(20)
    postalCode: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    country: string;
}

export class UpdateEmergencyContactDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    relationship: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsPhoneNumber()
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;
}

export class UpdateMedicalInfoDto {
    @ApiPropertyOptional({ enum: BloodGroup })
    @IsOptional()
    @IsEnum(BloodGroup)
    bloodGroup?: BloodGroup;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    medications?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    conditions?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    surgicalHistory?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    familyHistory?: string;
}

export class UpdateInsuranceInfoDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    provider: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    policyNumber: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    groupNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    validFrom?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    validTo?: Date;
}

export class UpdateCommunicationPrefsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    allowEmail?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    allowSMS?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    allowWhatsApp?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    allowPush?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    preferredLanguage?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    preferredContactTime?: string;
}

export class UpdateContactDto {
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

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateContactResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    updatedAt: Date;
    updatedBy: string;
}