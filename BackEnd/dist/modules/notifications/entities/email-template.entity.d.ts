import { Organization } from '../../organizations/entities/organization.entity';
export declare class EmailTemplate {
    id: string;
    content: string;
    type: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    variables: Record<string, string>;
    description: string;
    isActive: boolean;
    organizationId: string;
    organization: Organization;
    createdAt: Date;
    updatedAt: Date;
}
