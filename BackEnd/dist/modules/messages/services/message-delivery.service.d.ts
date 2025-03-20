import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Message } from '../entities/message.entity';
export declare class MessageDeliveryService {
    private readonly messageRepository;
    private readonly eventEmitter;
    private readonly logger;
    constructor(messageRepository: Repository<Message>, eventEmitter: EventEmitter2);
    processMessage(message: Message): Promise<void>;
    processBulkMessages(messages: Message[]): Promise<void>;
    private deliverMessage;
    retryMessage(messageId: string): Promise<void>;
}
