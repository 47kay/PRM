import { Role } from '../../users/enums/role.enum';
import { SubscriptionPlan } from '../../organizations/enums/subscription-plan.enum';
export declare class OrganizationAddressDto {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export declare class RegisterUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
}
export declare class RegisterOrganizationDto {
    name: string;
    website?: string;
    phone?: string;
    address?: OrganizationAddressDto;
    subscriptionPlan?: SubscriptionPlan;
}
export declare class RegisterDto {
    user: RegisterUserDto;
    organization: RegisterOrganizationDto;
}
export interface RegisterResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        organizationId: string;
    };
    organization: {
        id: string;
        name: string;
        subscriptionPlan: string;
        status: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
}
export interface RegistrationMetadata {
    userAgent: string;
    ip: string;
    deviceId?: string;
    verificationToken?: string;
    verificationExpires?: Date;
}
