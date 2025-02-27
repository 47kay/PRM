import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';
import { BloodGroup } from '../enums/blood-group.enum';
export declare class UpdateContactAddressDto {
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export declare class UpdateEmergencyContactDto {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}
export declare class UpdateMedicalInfoDto {
    bloodGroup?: BloodGroup;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    surgicalHistory?: string;
    familyHistory?: string;
}
export declare class UpdateInsuranceInfoDto {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    validFrom?: Date;
    validTo?: Date;
}
export declare class UpdateCommunicationPrefsDto {
    allowEmail?: boolean;
    allowSMS?: boolean;
    allowWhatsApp?: boolean;
    allowPush?: boolean;
    preferredLanguage?: string;
    preferredContactTime?: string;
}
export declare class UpdateContactDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    maritalStatus?: MaritalStatus;
    address?: UpdateContactAddressDto;
    emergencyContact?: UpdateEmergencyContactDto;
    medicalInfo?: UpdateMedicalInfoDto;
    insuranceInfo?: UpdateInsuranceInfoDto;
    communicationPrefs?: UpdateCommunicationPrefsDto;
    notes?: string;
    documents?: string[];
    tags?: string[];
    groups?: string[];
    isActive?: boolean;
}
export declare class UpdateContactResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    updatedAt: Date;
    updatedBy: string;
}
