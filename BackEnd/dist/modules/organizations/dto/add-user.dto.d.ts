import { Role } from '../../users/enums/role.enum';
export declare class AddressDto {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}
export declare class EmergencyContactDto {
    name: string;
    relationship: string;
    phone: string;
    address?: string;
}
export declare class AddUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    phoneNumber?: string;
    title?: string;
    department?: string;
    employeeId?: string;
    address?: AddressDto;
    emergencyContact?: EmergencyContactDto;
    licenseNumber?: string;
    specialization?: string;
    qualifications?: string[];
    certifications?: string[];
    languages?: string[];
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
