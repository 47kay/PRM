import { Message } from './entities/message.entity';
import { MessageDeliveryService } from './services/message-delivery.service';
export declare class MessagesModule {
}
export declare class MessageQueueListener {
    private readonly deliveryService;
    constructor(deliveryService: MessageDeliveryService);
    handleMessageCreated(message: Message): any;
    handleMessageResend(message: Message): any;
    handleBulkMessages(messages: Message[]): any;
}
import { Repository } from 'typeorm';
import { NotificationsService } from '../../notifications/services/notifications.service';
export declare class MessageDeliveryListener {
    private readonly messageRepository;
    private readonly notificationsService;
    constructor(messageRepository: Repository<Message>, notificationsService: NotificationsService);
    handleMessageDelivered(payload: {
        message: Message;
        deliveryDetails: any;
    }): Promise<void>;
    handleMessageFailed(payload: {
        message: Message;
        error: any;
    }): Promise<void>;
}
