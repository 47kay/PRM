// src/swagger/dtos/simple-contact.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SimpleContactDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  firstName: string;
  
  @ApiProperty()
  lastName: string;
  
  @ApiProperty()
  email: string;
  
  @ApiProperty()
  phoneNumber: string;
  
  @ApiProperty({ enum: ['PATIENT', 'EMERGENCY_CONTACT', 'FAMILY_MEMBER', 'OTHER'] })
  type: string;
}