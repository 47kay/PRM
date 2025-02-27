import { EmailStatus } from '../enums/email-status.enum';
import { Organization } from '../../organizations/entities/organization.entity';
import { EmailTemplate } from './email-template.entity';
export declare class EmailQueue {
    id: string;
    priority: number;
    attempts: number;
    maxAttempts: number;
    lastError: string;
    createdAt: Date;
    updatedAt: Date;
    sentAt: Date;
    data: any;
    organizationId: string;
    organization: Organization;
    templateId: string;
    template: EmailTemplate;
    recipient: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    variables: Record<string, any>;
    metadata: Record<string, any>;
    status: EmailStatus;
    scheduledFor: Date;
    processedAt: Date;
}
