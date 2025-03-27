// src/config/throttler.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions, ThrottlerOptionsFactory } from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      throttlers: [
        {
          limit: this.configService.get<number>('app.throttleLimit') || 10,
          ttl: (this.configService.get<number>('app.throttleTtl') || 60) * 1000,
        },
      ],
    };
  }
}