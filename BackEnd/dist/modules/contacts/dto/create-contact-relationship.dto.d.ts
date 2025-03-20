import { RelationshipType } from '../entities/contact-relationship.entity';
export declare class CreateContactRelationshipDto {
    relatedContactId: string;
    type: RelationshipType;
    inverseType?: RelationshipType;
    notes?: string;
    isPrimary?: boolean;
    startDate?: Date;
    endDate?: Date;
    metadata?: Record<string, any>;
}
export declare class UpdateContactRelationshipDto {
    type?: RelationshipType;
    inverseType?: RelationshipType;
    notes?: string;
    isPrimary?: boolean;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    metadata?: Record<string, any>;
}
export declare class ContactRelationshipResponseDto {
    id: string;
    contactId: string;
    relatedContactId: string;
    relatedContact: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        type: string;
    };
    type: RelationshipType;
    inverseType?: RelationshipType;
    notes?: string;
    isPrimary: boolean;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
