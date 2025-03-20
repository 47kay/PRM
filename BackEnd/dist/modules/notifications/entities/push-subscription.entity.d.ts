import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
export declare class PushSubscription {
    id: string;
    userId: string;
    user: User;
    organizationId: string;
    organization: Organization;
    subscription: string;
    endpoint: string;
    userAgent: string;
    active: boolean;
    lastUsed: Date;
    createdAt: Date;
    updatedAt: Date;
}
