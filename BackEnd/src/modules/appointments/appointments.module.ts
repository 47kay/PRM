// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../auth/controllers/auth.controller';
import { AuthService } from '../auth/services/auth.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { UsersModule } from '../users/users.module';


export enum AppointmentEventTypes {
    CREATED = 'appointment.created',
    UPDATED = 'appointment.updated',
    CANCELLED = 'appointment.cancelled',
    COMPLETED = 'appointment.completed',
    RESCHEDULED = 'appointment.rescheduled',
  }

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
    }),
    TypeOrmModule.forFeature([User, RefreshToken, Organization]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    PassportModule,
  ],
})
export class AppointmentsModule {}