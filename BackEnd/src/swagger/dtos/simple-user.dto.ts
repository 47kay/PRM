// src/swagger/dtos/simple-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SimpleUserDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  email: string;
  
  @ApiProperty()
  firstName: string;
  
  @ApiProperty()
  lastName: string;
  
  @ApiProperty()
  role: string;
  
  @ApiProperty()
  isActive: boolean;
  
  @ApiProperty()
  createdAt: Date;
}