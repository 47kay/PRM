import { Repository } from 'typeorm';
import { CallLog } from '../entities/call-log.entity';
import { FreeswitchService } from './freeswitch.service';
import { DratchioService } from './dratchio.service';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
export declare class CallManagerService {
    private freeswitchService;
    private dratchioService;
    private configService;
    private callLogRepository;
    private readonly logger;
    constructor(freeswitchService: FreeswitchService, dratchioService: DratchioService, configService: ConfigService, callLogRepository: Repository<CallLog>);
    placeCall(destination: string, options?: any): Promise<string>;
    handleIncomingCall(job: Job<{
        callId: string;
    }>): Promise<void>;
    private matchAppointment;
    playVoiceMessage(job: Job<{
        callUuid: string;
        message: string;
    }>): Promise<void>;
}
