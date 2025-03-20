import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Message } from '../entities/message.entity';
export declare class MessageSchedulerService implements OnModuleInit, OnModuleDestroy {
    private readonly messageRepository;
    private readonly eventEmitter;
    private readonly logger;
    private schedulerInterval;
    constructor(messageRepository: Repository<Message>, eventEmitter: EventEmitter2);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    scheduleMessage(message: Message, scheduledFor: Date): Promise<Message>;
    cancelScheduledMessage(messageId: string): Promise<void>;
    rescheduleMessage(messageId: string, newScheduledFor: Date): Promise<Message>;
    processScheduledMessages(): Promise<void>;
    getAllScheduledMessages(): Promise<Message[]>;
    getScheduledMessagesForPeriod(startDate: Date, endDate: Date): Promise<Message[]>;
}
