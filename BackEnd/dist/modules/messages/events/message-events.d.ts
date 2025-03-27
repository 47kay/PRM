import { Message } from '../entities/message.entity';
export declare enum MessageEventType {
    CREATED = "message.created",
    UPDATED = "message.updated",
    SENT = "message.sent",
    FAILED = "message.failed"
}
export declare class MessageEvent {
    readonly type: MessageEventType;
    readonly message: Message;
    constructor(type: MessageEventType, message: Message);
}
