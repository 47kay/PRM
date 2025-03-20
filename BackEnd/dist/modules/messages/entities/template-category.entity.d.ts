import { MessageTemplate } from './message-template.entity';
export declare class TemplateCategory {
    id: string;
    name: string;
    description: string;
    organizationId: string;
    templates: MessageTemplate[];
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
