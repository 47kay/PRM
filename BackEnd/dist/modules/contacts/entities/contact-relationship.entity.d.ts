import type { Contact } from './contact.entity';
export declare enum RelationshipType {
    SPOUSE = "SPOUSE",
    PARENT = "PARENT",
    CHILD = "CHILD",
    SIBLING = "SIBLING",
    GUARDIAN = "GUARDIAN",
    DEPENDENT = "DEPENDENT",
    EMERGENCY_CONTACT = "EMERGENCY_CONTACT",
    PRIMARY_CARE_PROVIDER = "PRIMARY_CARE_PROVIDER",
    SPECIALIST = "SPECIALIST",
    CAREGIVER = "CAREGIVER",
    RELATIVE = "RELATIVE",
    COLLEAGUE = "COLLEAGUE",
    FRIEND = "FRIEND",
    OTHER = "OTHER"
}
export declare class ContactRelationship {
    id: string;
    organizationId: string;
    contactId: string;
    contact: Contact;
    relatedContactId: string;
    relatedContact: Contact;
    type: RelationshipType;
    notes: string;
    isActive: boolean;
    isPrimary: boolean;
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    metadata: Record<string, any>;
    inverseType: RelationshipType;
    startDate: Date;
    endDate: Date;
}
