import { EventEmitter2 } from '@nestjs/event-emitter';
import { Message } from '../entities/message.entity';
import { MessageEvent } from './message-events';
export declare class MessageEventHandler {
    private eventEmitter;
    constructor(eventEmitter: EventEmitter2);
    emit(event: MessageEvent): void;
    emitCreated(message: Message): void;
}
