import { Organization } from '../../organizations/entities/organization.entity';
import { Role } from '../../users/enums/role.enum';
export declare class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: Role;
    permissions: string[];
    isEmailVerified: boolean;
    isActive: boolean;
    lastLoginAt: Date;
    organization: Organization;
    organizationId: string;
    createdBy?: string;
    createdAt: Date;
    updatedBy?: string;
    updatedAt: Date;
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
    passwordResetToken?: string;
    passwordResetExpiresAt?: Date;
    get fullName(): string;
    normalizeEmail(): void;
}
