// src/modules/voip/services/call-manager.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallLog } from '../entities/call-log.entity';
import { FreeswitchService } from './freeswitch.service';
import { DratchioService } from './dratchio.service';
import { ConfigService } from '@nestjs/config';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Injectable()
@Processor('voip-calls')
export class CallManagerService {
  private readonly logger = new Logger(CallManagerService.name);

  constructor(
    private freeswitchService: FreeswitchService,
    private dratchioService: DratchioService,
    private configService: ConfigService,
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
  ) {}

  async placeCall(destination: string, options: any = {}) {
    try {
      const provider = options.provider || 'default';
      const callerId = options.callerId || this.configService.get('DEFAULT_CALLER_ID');
      
      let callUuid: string;
      
      if (provider === 'dratchio') {
        callUuid = await this.dratchioService.placeCall(destination, callerId);
      } else {
        // Default to FreeSWITCH
        callUuid = await this.freeswitchService.placeCall(destination, callerId);
      }
      
      // Update appointment ID if this is a scheduled call
      if (options.appointmentId) {
        const callLog = await this.callLogRepository.findOne({ where: { callUuid } });
        if (callLog) {
          callLog.appointmentId = options.appointmentId;
          await this.callLogRepository.save(callLog);
        }
      }
      
      return callUuid;
    } catch (error) {
      this.logger.error(`Failed to place call: ${error.message}`);
      throw error;
    }
  }

  // Process call handling from the queue
  @Process('handle-incoming-call')
  async handleIncomingCall(job: Job<{ callId: string }>) {
    const { callId } = job.data;
    
    // Check if call is still active
    const callLog = await this.callLogRepository.findOne({ where: { callUuid: callId } });
    
    if (!callLog || callLog.status !== 'ringing') {
      // Call has been handled or hung up
      return;
    }
    
    // Check if this matches an appointment
    if (await this.matchAppointment(callLog)) {
      // Already handled by appointment service
      return;
    }
    
    // Auto-answer call and route to IVR
    // Implementation depends on how you want to handle calls
    this.logger.log(`Auto-handling incoming call ${callId}`);
  }

  private async matchAppointment(callLog: CallLog): Promise<boolean> {
    // This would be implemented to check against scheduled appointments
    // For example, query the appointments repository
    return false;
  }

  // Process playing voice messages
  @Process('play-voice-message')
  async playVoiceMessage(job: Job<{ callUuid: string, message: string }>) {
    const { callUuid, message } = job.data;
    
    try {
      // This would use FreeSWITCH's text-to-speech or play a recorded message
      // Implementation depends on your FreeSWITCH setup
      this.logger.log(`Playing message for call ${callUuid}: ${message}`);
    } catch (error) {
      this.logger.error(`Failed to play message: ${error.message}`);
    }
  }
}