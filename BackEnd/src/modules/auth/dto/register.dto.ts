// src/modules/auth/dto/register.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsString,
    IsNotEmpty,
    MinLength,
    MaxLength,
    Matches,
    IsOptional,
    IsPhoneNumber,
    IsEnum,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../users/enums/role.enum';
import { SubscriptionPlan } from '../../organizations/enums/subscription-plan.enum';

export class OrganizationAddressDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    street: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    country: string;
}

export class RegisterUserDto {
    @ApiProperty({
        description: 'User first name',
        example: 'John',
    })
    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be at least 2 characters long' })
    @MaxLength(50, { message: 'First name must not exceed 50 characters' })
    firstName: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
    })
    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
    lastName: string;

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
    })
    @IsEmail({}, { message: 'Please enter a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'Password123!',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        },
    )
    password: string;

    @ApiPropertyOptional({
        description: 'User phone number',
        example: '+1234567890',
    })
    @IsOptional()
    @IsPhoneNumber(undefined, { message: 'Please enter a valid phone number' })
    phone?: string;

    @ApiPropertyOptional({
        enum: Role,
        description: 'User role',
        default: Role.ADMIN,
    })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}

export class RegisterOrganizationDto {
    @ApiProperty({
        description: 'Organization name',
        example: 'Acme Medical Center',
    })
    @IsString()
    @IsNotEmpty({ message: 'Organization name is required' })
    @MinLength(2, { message: 'Organization name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Organization name must not exceed 100 characters' })
    name: string;

    @ApiPropertyOptional({
        description: 'Organization website',
        example: 'https://www.acmemedical.com',
    })
    @IsOptional()
    @IsString()
    @Matches(/^https?:\/\/.+\..+$/, {
        message: 'Please enter a valid website URL',
    })
    website?: string;

    @ApiPropertyOptional({
        description: 'Organization phone number',
        example: '+1234567890',
    })
    @IsOptional()
    @IsPhoneNumber(undefined, { message: 'Please enter a valid phone number' })
    phone?: string;

    @ApiPropertyOptional({
        description: 'Organization address',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => OrganizationAddressDto)
    address?: OrganizationAddressDto;

    @ApiPropertyOptional({
        enum: SubscriptionPlan,
        description: 'Subscription plan',
        default: SubscriptionPlan.BASIC,
    })
    @IsOptional()
    @IsEnum(SubscriptionPlan)
    subscriptionPlan?: SubscriptionPlan;
}

export class RegisterDto {
    @ApiProperty()
    @ValidateNested()
    @Type(() => RegisterUserDto)
    user: RegisterUserDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => RegisterOrganizationDto)
    organization: RegisterOrganizationDto;
}

// Response interfaces
export interface RegisterResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        organizationId: string;
    };
    organization: {
        id: string;
        name: string;
        subscriptionPlan: string;
        status: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
}

export interface RegistrationMetadata {
    userAgent: string;
    ip: string;
    deviceId?: string;
    verificationToken?: string;
    verificationExpires?: Date;
}