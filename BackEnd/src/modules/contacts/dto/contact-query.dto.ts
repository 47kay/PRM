// src/modules/contacts/dto/contact-query.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsEnum,
    IsBoolean,
    IsDateString,
    IsArray,
    IsInt,
    Min,
    Max,
    IsIn,
    ValidateNested,
    IsEmail,
    IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';
import { BloodGroup } from '../enums/blood-group.enum';

export enum ContactType {
    PATIENT = 'PATIENT',
    PROVIDER = 'PROVIDER',
    STAFF = 'STAFF',
    VENDOR = 'VENDOR',
    OTHER = 'OTHER',
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum SortField {
    FIRST_NAME = 'firstName',
    LAST_NAME = 'lastName',
    EMAIL = 'email',
    PHONE = 'phone',
    DATE_OF_BIRTH = 'dateOfBirth',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export class DateRangeDto {
    @ApiPropertyOptional({ description: 'Start date for filtering' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ description: 'End date for filtering' })
    @IsOptional()
    @IsDateString()
    to?: string;
}

export class ContactQueryDto {
    @ApiPropertyOptional({
        description: 'Search term to look in firstName, lastName, email, and phone',
        example: 'john',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Type of contact',
        enum: ContactType,
        example: ContactType.PATIENT,
    })
    @IsOptional()
    @IsEnum(ContactType)
    type?: ContactType;

    @ApiPropertyOptional({
        description: 'Filter by gender',
        enum: Gender,
    })
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @ApiPropertyOptional({
        description: 'Filter by marital status',
        enum: MaritalStatus,
    })
    @IsOptional()
    @IsEnum(MaritalStatus)
    maritalStatus?: MaritalStatus;

    @ApiPropertyOptional({
        description: 'Filter by blood group',
        enum: BloodGroup,
    })
    @IsOptional()
    @IsEnum(BloodGroup)
    bloodGroup?: BloodGroup;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by specific tags',
        type: [String],
        example: ['vip', 'recurring'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Filter by group IDs',
        type: [String],
        example: ['group1', 'group2'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    groups?: string[];

    @ApiPropertyOptional({
        description: 'Filter by creation date range',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeDto)
    createdAt?: DateRangeDto;

    @ApiPropertyOptional({
        description: 'Filter by update date range',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeDto)
    updatedAt?: DateRangeDto;

    @ApiPropertyOptional({
        description: 'Filter by date of birth range',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeDto)
    dateOfBirth?: DateRangeDto;

    @ApiPropertyOptional({
        description: 'Filter by city',
        example: 'New York',
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        description: 'Filter by state',
        example: 'NY',
    })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({
        description: 'Filter by country',
        example: 'USA',
    })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({
        description: 'Filter by postal code',
        example: '10001',
    })
    @IsOptional()
    @IsString()
    postalCode?: string;

    @ApiPropertyOptional({
        description: 'Filter by email',
        example: 'john.doe@example.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'Filter by phone number',
        example: '+1234567890',
    })
    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Filter by insurance provider',
        example: 'Blue Cross',
    })
    @IsOptional()
    @IsString()
    insuranceProvider?: string;

    @ApiPropertyOptional({
        description: 'Filter by medical conditions',
        type: [String],
        example: ['diabetes', 'hypertension'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    medicalConditions?: string[];

    @ApiPropertyOptional({
        description: 'Filter by allergies',
        type: [String],
        example: ['penicillin', 'peanuts'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @ApiPropertyOptional({
        description: 'Filter by created by user ID',
        example: 'user123',
    })
    @IsOptional()
    @IsString()
    createdBy?: string;

    @ApiPropertyOptional({
        description: 'Filter by updated by user ID',
        example: 'user123',
    })
    @IsOptional()
    @IsString()
    updatedBy?: string;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        minimum: 1,
        default: 1,
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        minimum: 1,
        maximum: 100,
        default: 10,
        example: 20,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({
        description: 'Field to sort by',
        enum: SortField,
        default: SortField.CREATED_AT,
    })
    @IsOptional()
    @IsIn(Object.values(SortField))
    sortBy?: SortField;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        default: SortOrder.DESC,
    })
    @IsOptional()
    @IsIn(Object.values(SortOrder))
    sortOrder?: SortOrder;

    @ApiPropertyOptional({
        description: 'Include inactive contacts in results',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    includeInactive?: boolean;

    @ApiPropertyOptional({
        description: 'Include contacts with upcoming appointments',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    hasUpcomingAppointments?: boolean;

    @ApiPropertyOptional({
        description: 'Only include contacts with recent activity',
        example: 30, // Last 30 days
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    recentActivityDays?: number;

    @ApiPropertyOptional({
        description: 'Only include contacts with specific communication preferences',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    allowsEmail?: boolean;

    @ApiPropertyOptional({
        description: 'Only include contacts that allow SMS',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    allowsSMS?: boolean;

    @ApiPropertyOptional({
        description: 'Only include contacts with documents',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    hasDocuments?: boolean;

    @ApiPropertyOptional({
        description: 'Only include contacts with medical history',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    hasMedicalHistory?: boolean;

    @ApiPropertyOptional({
        description: 'Preferred language for filtering',
        example: 'en',
    })
    @IsOptional()
    @IsString()
    preferredLanguage?: string;
}