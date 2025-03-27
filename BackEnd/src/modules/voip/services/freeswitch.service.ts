// src/modules/voip/services/freeswitch.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as esl from 'esl';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoipConfig } from '../entities/voip-config.entity';
import { CallLog } from '../entities/call-log.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FreeswitchService implements OnModuleInit {
  private readonly logger = new Logger(FreeswitchService.name);
  private connection: any;
  private isConnected = false;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(VoipConfig)
    private voipConfigRepository: Repository<VoipConfig>,
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
  ) {}

  async onModuleInit() {
    await this.connectToFreeswitch();
  }

  async connectToFreeswitch() {
    const config = await this.getFreeswitchConfig();
    
    try {
      this.connection = new (esl as any).Connection(
        config.host,
        config.port,
        config.password,
      );

      this.connection.on('esl::ready', () => {
        this.isConnected = true;
        this.logger.log('Connected to FreeSWITCH');
        
        // Subscribe to relevant events
        this.connection.subscribe([
          'CHANNEL_CREATE', 
          'CHANNEL_ANSWER',
          'CHANNEL_HANGUP_COMPLETE'
        ]);
      });

      this.connection.on('esl::end', () => {
        this.isConnected = false;
        this.logger.warn('Disconnected from FreeSWITCH');
        // Attempt reconnection after delay
        setTimeout(() => this.connectToFreeswitch(), 5000);
      });

      this.connection.on('esl::event::CHANNEL_CREATE::*', (event: any) => {
        this.handleCallStart(event);
      });

      this.connection.on('esl::event::CHANNEL_ANSWER::*', (event: any) => {
        this.handleCallAnswer(event);
      });

      this.connection.on('esl::event::CHANNEL_HANGUP_COMPLETE::*', (event: any) => {
        this.handleCallEnd(event);
      });

    } catch (error) {
      this.logger.error(`Failed to connect to FreeSWITCH: ${error.message}`);
      // Attempt reconnection after delay
      setTimeout(() => this.connectToFreeswitch(), 5000);
    }
  }

  private async getFreeswitchConfig(): Promise<VoipConfig> {
    let config = await this.voipConfigRepository.findOne({ where: { isActive: true } });
    
    if (!config) {
      // Use default config if none is found in DB
      return {
        host: this.configService.get('FREESWITCH_HOST', '127.0.0.1'),
        port: parseInt(this.configService.get('FREESWITCH_PORT', '8021')),
        password: this.configService.get('FREESWITCH_PASSWORD', 'ClueCon'),
        isActive: true,
      } as VoipConfig;
    }
    
    return config;
  }

  private async handleCallStart(event: any) {
    const callerId = event.getHeader('Caller-Caller-ID-Number');
    const destination = event.getHeader('Caller-Destination-Number');
    const uuid = event.getHeader('Unique-ID');
    
    this.logger.log(`Call started: ${callerId} -> ${destination} (UUID: ${uuid})`);
    
    // Create call log
    const callLog = this.callLogRepository.create({
      callUuid: uuid,
      callerNumber: callerId,
      destinationNumber: destination,
      startTime: new Date(),
      status: 'initiated',
    });
    
    await this.callLogRepository.save(callLog);
    
    // Emit event for other modules
    this.eventEmitter.emit('call.started', { uuid, callerId, destination });
  }

  private async handleCallAnswer(event: any) {
    const uuid = event.getHeader('Unique-ID');
    
    this.logger.log(`Call answered (UUID: ${uuid})`);
    
    // Update call log
    const callLog = await this.callLogRepository.findOne({ where: { callUuid: uuid } });
    if (callLog) {
      callLog.status = 'answered';
      callLog.answerTime = new Date();
      await this.callLogRepository.save(callLog);
    }
    
    // Emit event for other modules
    this.eventEmitter.emit('call.answered', { uuid });
  }

  private async handleCallEnd(event: any) {
    const uuid = event.getHeader('Unique-ID');
    const duration = parseInt(event.getHeader('variable_duration') || '0');
    const hangupCause = event.getHeader('variable_hangup_cause');
    
    this.logger.log(`Call ended (UUID: ${uuid}), duration: ${duration}s, cause: ${hangupCause}`);
    
    // Update call log
    const callLog = await this.callLogRepository.findOne({ where: { callUuid: uuid } });
    if (callLog) {
      callLog.status = 'completed';
      callLog.endTime = new Date();
      callLog.duration = duration;
      callLog.hangupCause = hangupCause;
      await this.callLogRepository.save(callLog);
    }
    
    // Emit event for other modules
    this.eventEmitter.emit('call.ended', { uuid, duration, hangupCause });
  }

  // Method to place outbound calls
  async placeCall(destination: string, callerId: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to FreeSWITCH');
    }
    
    const originationString = `{origination_caller_id_number=${callerId}}sofia/external/${destination}`;
    
    return new Promise((resolve, reject) => {
      this.connection.api('originate', originationString, (response: { body: string | undefined; }) => {
        if (response.body && response.body.includes('-ERR')) {
          this.logger.error(`Failed to place call: ${response.body}`);
          reject(new Error(Array.isArray(response.body) ? response.body.join(', ') : response.body));
        } else {
          // Extract UUID from response
          const uuid = response.body ? response.body.trim() : '';
          this.logger.log(`Call placed to ${destination}, UUID: ${uuid}`);
          resolve(uuid);
        }
      });
    });
  }

  // Send DTMF tones during active call
  async sendDTMF(uuid: string, digits: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to FreeSWITCH');
    }
    
    return new Promise((resolve, reject) => {
      this.connection.api('uuid_send_dtmf', `${uuid} ${digits}`, (response: { body: string | string[] | undefined; }) => {
        if (response.body && response.body.includes('-ERR')) {
          reject(new Error(Array.isArray(response.body) ? response.body.join(', ') : response.body));
        } else {
          resolve();
        }
      });
    });
  }

  // Hangup a call
  async hangupCall(uuid: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to FreeSWITCH');
    }
    
    return new Promise((resolve, reject) => {
      this.connection.api('uuid_kill', uuid, (response: { body: string | string[] | undefined; }) => {
        if (response.body && response.body.includes('-ERR')) {
          reject(new Error(Array.isArray(response.body) ? response.body.join(', ') : response.body));
        } else {
          resolve();
        }
      });
    });
  }
}