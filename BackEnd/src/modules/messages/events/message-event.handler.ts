import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Message } from '../entities/message.entity';
import { MessageEvent, MessageEventType } from './message-events';

@Injectable()
export class MessageEventHandler {
    constructor(private eventEmitter: EventEmitter2) {}
    
    emit(event: MessageEvent): void {
        this.eventEmitter.emit(event.type, event.message);
    }
    
    emitCreated(message: Message): void {
        this.emit(new MessageEvent(MessageEventType.CREATED, message));
    }
    
    // Other event emitters
}