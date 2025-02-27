import { Role } from '../enums/role.enum';
export declare class UserAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export declare class EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    address?: string;
}
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: Role;
    title?: string;
    department?: string;
    employeeId?: string;
    address?: UserAddress;
    emergencyContact?: EmergencyContact;
    licenseNumber?: string;
    specialization?: string;
    qualifications?: string[];
    certifications?: string[];
    isOnCall?: boolean;
    languages?: string[];
    requirePasswordChange?: boolean;
    preferences?: {
        theme?: string;
        notifications?: {
            email?: boolean;
            sms?: boolean;
            inApp?: boolean;
        };
        timezone?: string;
        language?: string;
    };
    metadata?: Record<string, any>;
}
