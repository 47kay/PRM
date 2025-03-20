import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';
import { BloodGroup } from '../enums/blood-group.enum';
import { DeepPartial } from 'typeorm';
import { User } from '../../users/entities/user.entity';
export declare class ContactAddressDto {
    street: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createdBy?: DeepPartial<User>;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export declare class EmergencyContactDto {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}
export declare class MedicalInfoDto {
    bloodGroup?: BloodGroup;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    surgicalHistory?: string;
    familyHistory?: string;
}
export declare class InsuranceInfoDto {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    validFrom: Date;
    validTo: Date;
}
export declare class CommunicationPrefsDto {
    allowEmail: boolean;
    allowSMS: boolean;
    allowWhatsApp: boolean;
    allowPush: boolean;
    preferredLanguage?: string;
    preferredContactTime?: string;
}
export declare class CreateContactDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsapp?: string;
    dateOfBirth: Date;
    gender: Gender;
    maritalStatus?: MaritalStatus;
    address: ContactAddressDto;
    emergencyContact: EmergencyContactDto;
    medicalInfo?: MedicalInfoDto;
    insuranceInfo?: InsuranceInfoDto;
    communicationPrefs: CommunicationPrefsDto;
    notes?: string;
    documents?: string[];
    tags?: string[];
    groups?: string[];
}
export declare class CreateContactResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    createdBy: string;
}
