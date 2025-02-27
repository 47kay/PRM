import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    IsEnum,
    IsOptional,
    MinLength,
    MaxLength,
    Matches,
    IsPhoneNumber,
    ValidateNested,
    IsArray,
    IsObject
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../users/enums/role.enum';

export class AddressDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    street?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    city?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    state?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(20)
    postalCode?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    country?: string;
}

export class EmergencyContactDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty()
    @IsString()
    @MaxLength(50)
    relationship: string;

    @ApiProperty()
    @IsPhoneNumber(undefined)
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    address?: string;
}

export class AddUserDto {
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
    @MaxLength(50)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
        }
    )
    password: string;

    @ApiProperty({ enum: Role })
    @IsEnum(Role)
    role: Role;

    @ApiPropertyOptional()
    @IsOptional()
    @IsPhoneNumber(undefined)
    phoneNumber?: string;

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
    @Type(() => AddressDto)
    address?: AddressDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => EmergencyContactDto)
    emergencyContact?: EmergencyContactDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    licenseNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
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
    @IsArray()
    @IsString({ each: true })
    languages?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
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
    @IsObject()
    metadata?: Record<string, any>;
}