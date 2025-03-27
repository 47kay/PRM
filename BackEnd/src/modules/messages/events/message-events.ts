import { Message } from '../entities/message.entity';

export enum MessageEventType {
    CREATED = 'message.created',
    UPDATED = 'message.updated',
    SENT = 'message.sent',
    FAILED = 'message.failed',
}

export class MessageEvent {
    constructor(
        public readonly type: MessageEventType,
        public readonly message: Message,
    ) {}
}