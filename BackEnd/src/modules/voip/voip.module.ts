// src/modules/voip/voip.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { FreeswitchService } from './services/freeswitch.service';
import { DratchioService } from './services/dratchio.service';
import { CallManagerService } from './services/call-manager.service';
import { VoipController } from './controllers/voip.controller';

import { VoipConfig } from './entities/voip-config.entity';
import { CallLog } from './entities/call-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoipConfig, CallLog]),
    BullModule.registerQueue({
      name: 'voip-calls',
    }),
    ConfigModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [VoipController],
  providers: [
    FreeswitchService,
    DratchioService,
    CallManagerService,
  ],
  exports: [
    FreeswitchService,
    DratchioService,
    CallManagerService,
  ],
})
export class VoipModule {}