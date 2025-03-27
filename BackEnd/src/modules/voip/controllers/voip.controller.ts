// src/modules/voip/controllers/voip.controller.ts
import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum';
import { CallManagerService } from '../services/call-manager.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('voip')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoipController {
  constructor(private callManagerService: CallManagerService) {}

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Roles(Role.ADMIN, Role.DOCTOR)
  async placeCall(@Body() data: { destination: string, options?: any }) {
    const { destination, options } = data;
    return {
      callId: await this.callManagerService.placeCall(destination, options),
    };
  }

  @Get('calls')
  @Roles(Role.ADMIN, Role.DOCTOR)
  async getCalls(@Query() query: any) {
    // Implementation to get call logs
  }

  @Get('calls/:id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  async getCallDetails(@Param('id') id: string) {
    // Implementation to get call details
  }
}