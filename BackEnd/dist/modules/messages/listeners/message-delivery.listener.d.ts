import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
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
