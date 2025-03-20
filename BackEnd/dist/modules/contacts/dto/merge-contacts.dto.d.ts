import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';
import { UpdateContactAddressDto, UpdateEmergencyContactDto, UpdateMedicalInfoDto, UpdateInsuranceInfoDto, UpdateCommunicationPrefsDto } from './update-contact.dto';
export declare class MergeContactsDto {
    primaryContactId: string;
    secondaryContactId: string;
    secondaryContactIds: string[];
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
    keepHistory?: boolean;
    deleteSecondaryContacts?: boolean;
}
export declare class MergeContactsResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    mergedContactIds: string[];
    mergedAt: Date;
    mergedBy: string;
}
