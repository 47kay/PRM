export declare enum OrganizationType {
    HOSPITAL = "HOSPITAL",
    CLINIC = "CLINIC",
    PRACTICE = "PRACTICE",
    LABORATORY = "LABORATORY",
    PHARMACY = "PHARMACY",
    OTHER = "OTHER"
}
export declare enum SubscriptionPlan {
    FREE = "FREE",
    STARTER = "STARTER",
    PROFESSIONAL = "PROFESSIONAL",
    ENTERPRISE = "ENTERPRISE"
}
export declare class Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export declare class Contact {
    name: string;
    position: string;
    email: string;
    phone: string;
}
export declare class CreateOrganizationDto {
    name: string;
    type: OrganizationType;
    description?: string;
    email: string;
    phone: string;
    domain?: string;
    address: Address;
    primaryContact: Contact;
    additionalContacts?: Contact[];
    subscriptionPlan: SubscriptionPlan;
    taxId?: string;
    registrationNumber?: string;
    licenseNumber?: string;
    settings?: {
        timezone?: string;
        dateFormat?: string;
        timeFormat?: string;
        currency?: string;
        language?: string;
        notificationSettings?: {
            email?: boolean;
            sms?: boolean;
            push?: boolean;
        };
        branding?: {
            logo?: string;
            colors?: {
                primary?: string;
                secondary?: string;
            };
        };
    };
    metadata?: Record<string, any>;
}
