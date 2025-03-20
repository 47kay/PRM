// src/modules/contacts/dto/create-contact-relationship.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsUUID,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsDate,
    IsNotEmpty,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationshipType } from '../entities/contact-relationship.entity';

export class CreateContactRelationshipDto {
    @ApiProperty({
        description: 'ID of the related contact',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    relatedContactId: string;

    @ApiProperty({
        description: 'Type of relationship',
        enum: RelationshipType,
        example: RelationshipType.EMERGENCY_CONTACT,
    })
    @IsEnum(RelationshipType)
    type: RelationshipType;

    @ApiPropertyOptional({
        description: 'Inverse type of relationship (from the related contact\'s perspective)',
        enum: RelationshipType,
        example: RelationshipType.DEPENDENT,
    })
    @IsOptional()
    @IsEnum(RelationshipType)
    inverseType?: RelationshipType;

    @ApiPropertyOptional({
        description: 'Additional notes about the relationship',
        example: 'Primary emergency contact, lives nearby',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @ApiPropertyOptional({
        description: 'Whether this is a primary relationship',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @ApiPropertyOptional({
        description: 'Start date of the relationship (if applicable)',
        example: '2023-01-01',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDate?: Date;

    @ApiPropertyOptional({
        description: 'End date of the relationship (if applicable)',
        example: '2023-12-31',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;

    @ApiPropertyOptional({
        description: 'Additional metadata for the relationship',
        example: {
            custodyPercentage: 50,
            legalAuthority: true,
            additionalInfo: 'Shared custody arrangement'
        },
    })
    @IsOptional()
    metadata?: Record<string, any>;
}

export class UpdateContactRelationshipDto {
    @ApiPropertyOptional({
        description: 'Type of relationship',
        enum: RelationshipType,
        example: RelationshipType.EMERGENCY_CONTACT,
    })
    @IsOptional()
    @IsEnum(RelationshipType)
    type?: RelationshipType;

    @ApiPropertyOptional({
        description: 'Inverse type of relationship (from the related contact\'s perspective)',
        enum: RelationshipType,
        example: RelationshipType.DEPENDENT,
    })
    @IsOptional()
    @IsEnum(RelationshipType)
    inverseType?: RelationshipType;

    @ApiPropertyOptional({
        description: 'Additional notes about the relationship',
        example: 'Primary emergency contact, lives nearby',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @ApiPropertyOptional({
        description: 'Whether this is a primary relationship',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @ApiPropertyOptional({
        description: 'Whether this relationship is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Start date of the relationship (if applicable)',
        example: '2023-01-01',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDate?: Date;

    @ApiPropertyOptional({
        description: 'End date of the relationship (if applicable)',
        example: '2023-12-31',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;

    @ApiPropertyOptional({
        description: 'Additional metadata for the relationship',
        example: {
            custodyPercentage: 50,
            legalAuthority: true,
            additionalInfo: 'Shared custody arrangement'
        },
    })
    @IsOptional()
    metadata?: Record<string, any>;
}

export class ContactRelationshipResponseDto {
    id: string;
    contactId: string;
    relatedContactId: string;
    relatedContact: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        type: string;
    };
    type: RelationshipType;
    inverseType?: RelationshipType;
    notes?: string;
    isPrimary: boolean;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}