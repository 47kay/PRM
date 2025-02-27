// src/modules/organizations/dto/create-organization.dto.ts

import {
    IsString,
    IsEmail,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsObject,
    ValidateNested,
    IsArray,
    IsPhoneNumber,
    MaxLength,
    MinLength,
    Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrganizationType {
    HOSPITAL = 'HOSPITAL',
    CLINIC = 'CLINIC',
    PRACTICE = 'PRACTICE',
    LABORATORY = 'LABORATORY',
    PHARMACY = 'PHARMACY',
    OTHER = 'OTHER',
}

export enum SubscriptionPlan {
    FREE = 'FREE',
    STARTER = 'STARTER',
    PROFESSIONAL = 'PROFESSIONAL',
    ENTERPRISE = 'ENTERPRISE',
}

export class Address {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    street: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    city: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    state: string;

    @ApiProperty()
    @IsString()
    @MaxLength(20)
    postalCode: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    country: string;
}

export class Contact {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    position: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsPhoneNumber()
    phone: string;
}

export class CreateOrganizationDto {
    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @Matches(/^[a-zA-Z0-9\s\-_]+$/)
    name: string;

    @ApiProperty({ enum: OrganizationType })
    @IsEnum(OrganizationType)
    type: OrganizationType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsPhoneNumber()
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)
    domain?: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => Address)
    address: Address;

    @ApiProperty()
    @ValidateNested()
    @Type(() => Contact)
    primaryContact: Contact;

    @ApiPropertyOptional({ type: [Contact] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Contact)
    additionalContacts?: Contact[];

    @ApiProperty({ enum: SubscriptionPlan })
    @IsEnum(SubscriptionPlan)
    subscriptionPlan: SubscriptionPlan;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    taxId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    registrationNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    licenseNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    settings?: {
        timezone?: string;
        dateFormat?: string;
        timeFormat?: string;
        currency?: string;
        language?: string;
        notificationSettings?: {
            email?: boolean;
            sms?: boolean;
            push?: boolean;
        };
        branding?: {
            logo?: string;
            colors?: {
                primary?: string;
                secondary?: string;
            };
        };
    };

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}