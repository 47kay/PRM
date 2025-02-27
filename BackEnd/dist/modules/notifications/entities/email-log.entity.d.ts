import { EmailStatus } from '../enums/email-status.enum';
import { Organization } from '../../organizations/entities/organization.entity';
import { EmailTemplate } from './email-template.entity';
export declare class EmailLog {
    id: string;
    organizationId: string;
    organization: Organization;
    templateId: string;
    template: EmailTemplate;
    recipient: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    metadata: Record<string, any>;
    status: EmailStatus;
    error: string;
    messageId: string;
    providerResponse: string;
    createdAt: Date;
    sentAt: Date;
    deliveredAt: Date;
    openedAt: Date;
    clickedAt: Date;
}
