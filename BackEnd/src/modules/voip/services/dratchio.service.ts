// src/modules/voip/services/dratchio.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoipConfig } from '../entities/voip-config.entity';
import { FreeswitchService } from './freeswitch.service';
import { CallLog } from '../entities/call-log.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

// Interface for DratchioClient to handle type checking
interface IDratchioClient {
  on(event: string, callback: Function): IDratchioClient;
  register(): Promise<void>;
  call(options: { to: string; from: string }): Promise<{
    uuid: string;
    answer: () => void;
    hangup: () => void;
  }>;
}

@Injectable()
export class DratchioService {
  private readonly logger = new Logger(DratchioService.name);
  private dratchioClient: IDratchioClient | null = null;

  constructor(
    private configService: ConfigService,
    private freeswitchService: FreeswitchService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(VoipConfig)
    private voipConfigRepository: Repository<VoipConfig>,
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
    @InjectQueue('voip-calls')
    private voipQueue: Queue,
  ) {
    // Initialize Dratchio integration
    this.initializeDratchio().catch(err => {
      this.logger.error(`Error during Dratchio initialization: ${err.message}`);
    });
  }

  private async initializeDratchio() {
    try {
      // Import dynamically to avoid issues if package isn't installed
      const module = await import('../../../libs/dratchio');
      const { DratchioClient } = module;
      
      const config = await this.getDratchioConfig();
      
      this.dratchioClient = new DratchioClient({
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
        sipServer: config.sipServer,
        sipUsername: config.sipUsername,
        sipPassword: config.sipPassword,
      });
      
      this.dratchioClient.on('registered', () => {
        this.logger.log('Dratchio SIP client registered successfully');
      });
      
      this.dratchioClient.on('registrationFailed', (error: Error) => {
        this.logger.error(`Dratchio SIP registration failed: ${error.message}`);
      });
      
      this.dratchioClient.on('incomingCall', (call: any) => {
        this.handleIncomingCall(call);
      });
      
      await this.dratchioClient.register();
      this.logger.log('Dratchio service initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize Dratchio: ${error.message}`);
    }
  }

  private async getDratchioConfig(): Promise<any> {
    const config = await this.voipConfigRepository.findOne({ 
      where: { isActive: true, provider: 'dratchio' } 
    });
    
    if (!config) {
      return {
        apiKey: this.configService.get<string>('DRATCHIO_API_KEY'),
        apiSecret: this.configService.get<string>('DRATCHIO_API_SECRET'),
        sipServer: this.configService.get<string>('DRATCHIO_SIP_SERVER'),
        sipUsername: this.configService.get<string>('DRATCHIO_SIP_USERNAME'),
        sipPassword: this.configService.get<string>('DRATCHIO_SIP_PASSWORD'),
      };
    }
    
    return JSON.parse(config.configJson || '{}');
  }

  private async handleIncomingCall(call: any) {
    const { callerId, destination } = call;
    
    this.logger.log(`Incoming call from ${callerId} to ${destination}`);
    
    // Create call log
    const callLog = this.callLogRepository.create({
      callUuid: call.uuid,
      callerNumber: callerId,
      destinationNumber: destination,
      startTime: new Date(),
      status: 'ringing',
      provider: 'dratchio',
    });
    
    await this.callLogRepository.save(callLog);
    
    // Emit event for the appointment module to check if this is a scheduled call
    this.eventEmitter.emit('dratchio.incomingCall', { 
      uuid: call.uuid, 
      callerId, 
      destination,
      accept: () => call.answer(),
      reject: () => call.hangup()
    });
    
    // Queue for auto-handling if no one handles the call within 5 seconds
    await this.voipQueue.add('handle-incoming-call', { callId: call.uuid }, {
      delay: 5000
    });
  }

  // Method to place outbound calls via Dratchio
  async placeCall(destination: string, callerId: string): Promise<string> {
    if (!this.dratchioClient) {
      throw new Error('Dratchio client not initialized');
    }
    
    try {
      const call = await this.dratchioClient.call({
        to: destination,
        from: callerId,
      });
      
      // Create call log
      const callLog = this.callLogRepository.create({
        callUuid: call.uuid,
        callerNumber: callerId,
        destinationNumber: destination,
        startTime: new Date(),
        status: 'initiated',
        provider: 'dratchio',
      });
      
      await this.callLogRepository.save(callLog);
      
      return call.uuid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to place call: ${errorMessage}`);
      throw error;
    }
  }

  // Event handler for appointment reminders
  @OnEvent('appointment.reminder')
  async handleAppointmentReminder(payload: { patientPhone: string, message: string }) {
    const { patientPhone, message } = payload;
    const clinicNumber = this.configService.get<string>('CLINIC_PHONE_NUMBER') || '';
    
    try {
      // First, place a call
      const callUuid = await this.placeCall(patientPhone, clinicNumber);
      
      // Queue message to be played when call is answered
      await this.voipQueue.add('play-voice-message', {
        callUuid,
        message,
      });
      
      this.logger.log(`Appointment reminder call placed to ${patientPhone}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send appointment reminder call: ${errorMessage}`);
    }
  }
}