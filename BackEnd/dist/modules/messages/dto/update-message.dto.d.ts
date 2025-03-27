import { CreateMessageDto } from './create-message.dto';
import { MessageStatus } from './create-message.dto';
declare const UpdateMessageDto_base: import("@nestjs/common").Type<Partial<Omit<CreateMessageDto, "type" | "contactId">>>;
export declare class UpdateMessageDto extends UpdateMessageDto_base {
    status?: MessageStatus;
    subject?: string;
    metadata?: Record<string, any>;
}
export {};
