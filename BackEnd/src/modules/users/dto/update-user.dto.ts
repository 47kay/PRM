// src/modules/users/dto/update-user.dto.ts

import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['password', 'email'] as const)
) {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isLocked?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPhoneVerified?: boolean;
}