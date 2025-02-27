// src/modules/users/dto/create-user.dto.ts

import {
    IsString,
    IsEmail,
    IsEnum,
    IsOptional,
    IsArray,
    IsBoolean,
    MinLength,
    MaxLength,
    Matches,
    IsPhoneNumber,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class UserAddress {
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

export class EmergencyContact {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    relationship: string;

    @ApiProperty()
    @IsPhoneNumber()
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    address?: string;
}

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @ApiProperty()
    @IsEmail()
    @MaxLength(100)
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        }
    )
    password: string;

    @ApiProperty()
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty({ enum: Role })
    @IsEnum(Role)
    role: Role;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    department?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    employeeId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => UserAddress)
    address?: UserAddress;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => EmergencyContact)
    emergencyContact?: EmergencyContact;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    licenseNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    specialization?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    qualifications?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    certifications?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isOnCall?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    languages?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    requirePasswordChange?: boolean = true;

    @ApiPropertyOptional()
    @IsOptional()
    preferences?: {
        theme?: string;
        notifications?: {
            email?: boolean;
            sms?: boolean;
            inApp?: boolean;
        };
        timezone?: string;
        language?: string;
    };

    @ApiPropertyOptional()
    @IsOptional()
    metadata?: Record<string, any>;
}