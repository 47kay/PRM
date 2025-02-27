import { Organization } from './organization.entity';
import { User } from '../../users/entities/user.entity';
export declare enum InvitationStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    DECLINED = "DECLINED",
    EXPIRED = "EXPIRED",
    REVOKED = "REVOKED"
}
export declare class OrganizationInvitation {
    id: string;
    organizationId: string;
    organization: Organization;
    email: string;
    invitedUserId: string;
    invitedUser: User;
    invitedById: string;
    invitedBy: User;
    status: InvitationStatus;
    roles: string[];
    departmentIds: string[];
    expiresAt: Date;
    acceptedAt: Date;
    declinedAt: Date;
    revokedAt: Date;
    revokedById: string;
    revokedBy: User;
    token: string;
    message: string;
    metadata: Record<string, any>;
    isResent: boolean;
    lastResentAt: Date;
    resendCount: number;
    createdAt: Date;
    updatedAt: Date;
    isExpired(): boolean;
    canBeResent(): boolean;
    canBeAccepted(): boolean;
    canBeRevoked(): boolean;
}
