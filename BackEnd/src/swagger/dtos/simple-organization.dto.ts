// src/swagger/dtos/simple-organization.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SimpleOrganizationDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  type: string;
  
  @ApiProperty()
  status: string;
}