// src/modules/organizations/dto/update-organization.dto.ts

import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOrganizationDto extends PartialType(
    OmitType(CreateOrganizationDto, ['subscriptionPlan'] as const)
) {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;
}