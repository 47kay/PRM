import { MessageStatus } from '../enums/message-status.enum';
import { MessageType } from '../enums/message-type.enum';
export declare class MessageQueryDto {
    status?: MessageStatus;
    startDate?: Date;
    endDate?: Date;
    type?: MessageType;
    contactId?: string;
    senderId?: string;
    search?: string;
    isRead?: boolean;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
    organizationId?: string;
}
