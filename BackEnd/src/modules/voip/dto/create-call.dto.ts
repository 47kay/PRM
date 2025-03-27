// src/modules/voip/dto/create-call.dto.ts
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateCallDto {
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsOptional()
  callerId?: string;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsObject()
  @IsOptional()
  options?: any;
}