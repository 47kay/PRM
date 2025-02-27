import { Organization } from '../../organizations/entities/organization.entity';
export declare class NotificationTemplate {
    id: string;
    name: string;
    description: string;
    subject: string;
    content: string;
    metadata: Record<string, any>;
    channels: string[];
    isActive: boolean;
    organizationId: string;
    organization: Organization;
    variables: {
        name: string;
        type: 'string' | 'number' | 'boolean' | 'date';
        required: boolean;
        defaultValue?: any;
    }[];
    channelSpecificContent: {
        email?: {
            htmlTemplate?: string;
            plainTextTemplate?: string;
        };
        sms?: {
            template: string;
        };
        push?: {
            title: string;
            body: string;
        };
        webhook?: {
            payload: Record<string, any>;
        };
    };
    createdAt: Date;
    updatedAt: Date;
    lastUsedAt: Date;
    useCount: number;
}
