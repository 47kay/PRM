import { MessageType } from '../enums/message-type.enum';
export declare class TemplateVariablesDto {
    contact?: Record<string, any>;
    organization?: Record<string, any>;
    custom?: Record<string, any>;
}
export declare class MessageTemplateDto {
    name: string;
    description?: string;
    type: MessageType;
    subject?: string;
    content: string;
    variables?: TemplateVariablesDto;
    isDefault?: boolean;
    category?: string;
    organizationId?: string;
    createdBy?: string;
}
