import { Message } from '../entities/message.entity';
import { MessageDeliveryService } from '../services/message-delivery.service';
export declare class MessageQueueListener {
    private readonly deliveryService;
    constructor(deliveryService: MessageDeliveryService);
    handleMessageCreated(message: Message): Promise<void>;
    handleMessageResend(message: Message): Promise<void>;
    handleBulkMessages(messages: Message[]): Promise<void>;
}
