import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';
import { BloodGroup } from '../enums/blood-group.enum';
export declare enum ContactType {
    PATIENT = "PATIENT",
    PROVIDER = "PROVIDER",
    STAFF = "STAFF",
    VENDOR = "VENDOR",
    OTHER = "OTHER"
}
export declare enum SortOrder {
    ASC = "ASC",
    DESC = "DESC"
}
export declare enum SortField {
    FIRST_NAME = "firstName",
    LAST_NAME = "lastName",
    EMAIL = "email",
    PHONE = "phone",
    DATE_OF_BIRTH = "dateOfBirth",
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt"
}
export declare class DateRangeDto {
    from?: string;
    to?: string;
}
export declare class ContactQueryDto {
    search?: string;
    type?: ContactType;
    gender?: Gender;
    maritalStatus?: MaritalStatus;
    bloodGroup?: BloodGroup;
    isActive?: boolean;
    tags?: string[];
    groups?: string[];
    createdAt?: DateRangeDto;
    updatedAt?: DateRangeDto;
    dateOfBirth?: DateRangeDto;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    email?: string;
    phone?: string;
    insuranceProvider?: string;
    medicalConditions?: string[];
    allergies?: string[];
    createdBy?: string;
    updatedBy?: string;
    page?: number;
    limit?: number;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    includeInactive?: boolean;
    hasUpcomingAppointments?: boolean;
    recentActivityDays?: number;
    allowsEmail?: boolean;
    allowsSMS?: boolean;
    hasDocuments?: boolean;
    hasMedicalHistory?: boolean;
    preferredLanguage?: string;
}
