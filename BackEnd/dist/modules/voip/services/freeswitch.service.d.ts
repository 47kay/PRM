import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { VoipConfig } from '../entities/voip-config.entity';
import { CallLog } from '../entities/call-log.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class FreeswitchService implements OnModuleInit {
    private configService;
    private eventEmitter;
    private voipConfigRepository;
    private callLogRepository;
    private readonly logger;
    private connection;
    private isConnected;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2, voipConfigRepository: Repository<VoipConfig>, callLogRepository: Repository<CallLog>);
    onModuleInit(): Promise<void>;
    connectToFreeswitch(): Promise<void>;
    private getFreeswitchConfig;
    private handleCallStart;
    private handleCallAnswer;
    private handleCallEnd;
    placeCall(destination: string, callerId: string): Promise<string>;
    sendDTMF(uuid: string, digits: string): Promise<void>;
    hangupCall(uuid: string): Promise<void>;
}
