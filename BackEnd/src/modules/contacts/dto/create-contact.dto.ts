// src/modules/contacts/dto/create-contact.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    IsPhoneNumber,
    IsDate,
    IsEnum,
    IsOptional,
    IsBoolean,
    MinLength,
    MaxLength,
    ValidateNested,
    IsArray,
    IsUrl,
    IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';
import { BloodGroup } from '../enums/blood-group.enum';
import { DeepPartial } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export class ContactAddressDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    street: string;

    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createdBy?: DeepPartial<User>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    street2?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    city: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    state: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    postalCode: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    country: string;
}

export class EmergencyContactDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    relationship: string;

    @ApiProperty()
    @IsPhoneNumber()
    @IsNotEmpty()
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;
}

export class MedicalInfoDto {
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

export class InsuranceInfoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    provider: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    policyNumber: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    groupNumber?: string;

    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    validFrom: Date;

    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    validTo: Date;
}

export class CommunicationPrefsDto {
    @ApiProperty()
    @IsBoolean()
    allowEmail: boolean = true;

    @ApiProperty()
    @IsBoolean()
    allowSMS: boolean = true;

    @ApiProperty()
    @IsBoolean()
    allowWhatsApp: boolean = true;

    @ApiProperty()
    @IsBoolean()
    allowPush: boolean = true;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    preferredLanguage?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    preferredContactTime?: string;
}

export class CreateContactDto {
    @ApiProperty({
        description: 'First name of the contact',
        example: 'John',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @ApiProperty({
        description: 'Last name of the contact',
        example: 'Doe',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @ApiProperty({
        description: 'Email address',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Phone number',
        example: '+1234567890',
    })
    @IsPhoneNumber()
    @IsNotEmpty()
    phone: string;

    @ApiPropertyOptional({
        description: 'WhatsApp number',
        example: '+1234567890',
    })
    @IsOptional()
    @IsPhoneNumber()
    whatsapp?: string;

    @ApiProperty({
        description: 'Date of birth',
        example: '1990-01-01',
    })
    @IsDate()
    @Type(() => Date)
    dateOfBirth: Date;

    @ApiProperty({
        description: 'Gender',
        enum: Gender,
    })
    @IsEnum(Gender)
    gender: Gender;

    @ApiPropertyOptional({
        description: 'Marital status',
        enum: MaritalStatus,
    })
    @IsOptional()
    @IsEnum(MaritalStatus)
    maritalStatus?: MaritalStatus;

    @ApiProperty({
        description: 'Contact address',
    })
    @ValidateNested()
    @Type(() => ContactAddressDto)
    address: ContactAddressDto;

    @ApiProperty({
        description: 'Emergency contact information',
    })
    @ValidateNested()
    @Type(() => EmergencyContactDto)
    emergencyContact: EmergencyContactDto;

    @ApiPropertyOptional({
        description: 'Medical information',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => MedicalInfoDto)
    medicalInfo?: MedicalInfoDto;

    @ApiPropertyOptional({
        description: 'Insurance information',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => InsuranceInfoDto)
    insuranceInfo?: InsuranceInfoDto;

    @ApiProperty({
        description: 'Communication preferences',
    })
    @ValidateNested()
    @Type(() => CommunicationPrefsDto)
    communicationPrefs: CommunicationPrefsDto;

    @ApiPropertyOptional({
        description: 'Additional notes',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @ApiPropertyOptional({
        description: 'Document URLs',
        type: [String],
    })
    @IsOptional()
    @IsUrl({}, { each: true })
    @IsArray()
    documents?: string[];

    @ApiPropertyOptional({
        description: 'Contact tags',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Contact group IDs',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    groups?: string[];
}

export class CreateContactResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    createdBy: string;
}