import type { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
export declare enum TemplateCategory {
    WELCOME = "welcome",
    NOTIFICATION = "notification",
    REMINDER = "reminder",
    MARKETING = "marketing",
    SUPPORT = "support",
    CUSTOM = "custom"
}
export declare enum TemplateType {
    SMS = "sms",
    EMAIL = "email",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare class MessageTemplate {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    type: TemplateType;
    subject: string;
    content: string;
    parameters: Record<string, any>;
    isDefault: boolean;
    isActive: boolean;
    createdBy: User;
    createdById: string;
    organization: Organization;
    organizationId: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
