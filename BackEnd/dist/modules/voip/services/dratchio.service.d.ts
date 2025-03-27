import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { VoipConfig } from '../entities/voip-config.entity';
import { FreeswitchService } from './freeswitch.service';
import { CallLog } from '../entities/call-log.entity';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class DratchioService {
    private configService;
    private freeswitchService;
    private eventEmitter;
    private voipConfigRepository;
    private callLogRepository;
    private voipQueue;
    private readonly logger;
    private dratchioClient;
    constructor(configService: ConfigService, freeswitchService: FreeswitchService, eventEmitter: EventEmitter2, voipConfigRepository: Repository<VoipConfig>, callLogRepository: Repository<CallLog>, voipQueue: Queue);
    private initializeDratchio;
    private getDratchioConfig;
    private handleIncomingCall;
    placeCall(destination: string, callerId: string): Promise<string>;
    handleAppointmentReminder(payload: {
        patientPhone: string;
        message: string;
    }): Promise<void>;
}
