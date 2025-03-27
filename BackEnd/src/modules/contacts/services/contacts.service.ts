// src/modules/contacts/services/contacts.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, DataSource, Not } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { ContactQueryDto } from '../dto/contact-query.dto';
import { ContactRelationship, RelationshipType } from '../entities/contact-relationship.entity';
import { MedicalHistory } from '../../medical-history/medical-history.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Document } from '../../documents/entities/document.entity';

// Define interfaces directly in the service to avoid import issues
export interface CreateContactRelationshipDto {
    relatedContactId: string;
    type: RelationshipType;
    inverseType?: RelationshipType;
    notes?: string;
    isPrimary?: boolean;
    startDate?: Date;
    endDate?: Date;
    metadata?: Record<string, any>;
}

export interface UpdateContactRelationshipDto {
    type?: RelationshipType;
    inverseType?: RelationshipType;
    notes?: string;
    isPrimary?: boolean;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    metadata?: Record<string, any>;
}

/**
 * Gets the inverse relationship type for bidirectional relationships
 * @param type The original relationship type
 * @returns The inverse relationship type or undefined
 */
function getInverseRelationshipType(type: RelationshipType): RelationshipType | undefined {
    const inverseMap: Record<RelationshipType, RelationshipType> = {
        [RelationshipType.SPOUSE]: RelationshipType.SPOUSE,
        [RelationshipType.PARENT]: RelationshipType.CHILD,
        [RelationshipType.CHILD]: RelationshipType.PARENT,
        [RelationshipType.SIBLING]: RelationshipType.SIBLING,
        [RelationshipType.GUARDIAN]: RelationshipType.DEPENDENT,
        [RelationshipType.DEPENDENT]: RelationshipType.GUARDIAN,
        [RelationshipType.EMERGENCY_CONTACT]: RelationshipType.OTHER,
        [RelationshipType.PRIMARY_CARE_PROVIDER]: RelationshipType.OTHER,
        [RelationshipType.SPECIALIST]: RelationshipType.OTHER,
        [RelationshipType.CAREGIVER]: RelationshipType.OTHER,
        [RelationshipType.RELATIVE]: RelationshipType.RELATIVE,
        [RelationshipType.COLLEAGUE]: RelationshipType.COLLEAGUE,
        [RelationshipType.FRIEND]: RelationshipType.FRIEND,
        [RelationshipType.OTHER]: RelationshipType.OTHER,
    };

    return inverseMap[type];
}

interface MergedRecord {
    id: string;
}

@Injectable()
export class ContactsService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
        @InjectRepository(ContactRelationship)
        private readonly relationshipRepository: Repository<ContactRelationship>,
        @InjectRepository(MedicalHistory)
        private readonly medicalHistoryRepository: Repository<MedicalHistory>,
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
        private readonly dataSource: DataSource,
    ) { }



    async create(data: CreateContactDto & { organizationId: string; createdBy: string }): Promise<Contact> {
        const existingContact = await this.contactRepository.findOne({
            where: [
                { email: data.email, organizationId: data.organizationId },
                { phone: data.phone, organizationId: data.organizationId },
            ],
        });

        if (existingContact) {
            throw new ConflictException('Contact with this email or phone number already exists');
        }

        // Extract documents data if it exists to handle properly
        const { documents: documentIds, ...contactData } = data;

        // Create a new contact with correct property mapping
        const contact = new Contact();
        Object.assign(contact, contactData);

        // Set createdBy properly - use the string ID directly instead of object
        contact.createdById = data.createdBy;

        // Handle documents properly if present
        if (documentIds && Array.isArray(documentIds)) {
            // Find existing documents or create references using the IDs
            const documents = await this.documentRepository.find({
                where: { id: In(documentIds) }
            });

            // If documents exist, assign them to the contact
            if (documents.length > 0) {
                contact.documents = documents;
            }
        }

        const savedContact = await this.contactRepository.save(contact);
        return savedContact;
    }



    async findAll(query: ContactQueryDto & { organizationId: string }): Promise<Pagination<Contact>> {
        const { organizationId, search, type, isActive, page = 1, limit = 10, ...filters } = query as { organizationId: string, search?: string, type?: string, isActive?: boolean, page?: number, limit?: number, [key: string]: any };

        const queryBuilder = this.contactRepository.createQueryBuilder('contact')
            .where('contact.organizationId = :organizationId', { organizationId });

        if (search) {
            queryBuilder.andWhere(
                '(LOWER(contact.firstName) LIKE LOWER(:search) OR LOWER(contact.lastName) LIKE LOWER(:search) OR LOWER(contact.email) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }

        if (type) {
            queryBuilder.andWhere('contact.type = :type', { type });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('contact.isActive = :isActive', { isActive });
        }

        Object.keys(filters).forEach(key => {
            queryBuilder.andWhere(`contact.${key} = :${key}`, { [key]: filters[key] });
        });

        // Fixed pagination by using explicit type parameter
        return paginate<Contact>(queryBuilder, { page, limit });
    }

    async search(searchTerm: string, query: ContactQueryDto & { organizationId: string }) {
        const { organizationId, page = 1, limit = 10 } = query;

        const queryBuilder = this.contactRepository.createQueryBuilder('contact')
            .where('contact.organizationId = :organizationId', { organizationId })
            .andWhere(
                '(LOWER(contact.firstName) LIKE LOWER(:search) OR LOWER(contact.lastName) LIKE LOWER(:search) OR LOWER(contact.email) LIKE LOWER(:search) OR contact.phone LIKE :search)',
                { search: `%${searchTerm}%` }
            );

        // Fixed pagination by using explicit type parameter
        return paginate<Contact>(queryBuilder, { page, limit });
    }

    async findOne(id: string, organizationId: string): Promise<Contact> {
        const contact = await this.contactRepository.findOne({
            where: { id, organizationId },
            relations: ['documents', 'appointments', 'medicalHistory'],
        });

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        return contact;
    }

    async update(
        id: string,
        data: UpdateContactDto & { organizationId: string; updatedBy: string; phone?: string }
    ): Promise<Contact> {
        const contact = await this.findOne(id, data.organizationId);

        // Check unique constraints if email or phone is being updated
        if (data.email || data.phone) {
            const whereCondition = [];

            if (data.email) {
                whereCondition.push({ email: data.email, organizationId: data.organizationId, id: Not(id) });
            }

            if (data.phone) {
                whereCondition.push({ phone: data.phone, organizationId: data.organizationId, id: Not(id) });
            }

            const existingContact = await this.contactRepository.findOne({
                where: whereCondition,
            });

            if (existingContact) {
                throw new ConflictException('Contact with this email or phone number already exists');
            }
        }

        // Update the updatedById field instead of trying to create a relation
        Object.assign(contact, {
            ...data,
            updatedById: data.updatedBy
        });
        
        return this.contactRepository.save(contact);
    }

    async remove(id: string, organizationId: string): Promise<void> {
        const contact = await this.findOne(id, organizationId);
        await this.contactRepository.softRemove(contact);
    }

    async merge(
        primaryId: string,
        secondaryId: string,
        context: { organizationId: string; userId: string }
    ): Promise<Contact> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const [primary, secondary] = await Promise.all([
                this.findOne(primaryId, context.organizationId),
                this.findOne(secondaryId, context.organizationId),
            ]);

            // Merge basic information (keeping primary's core data)
            if (!primary.middleName) primary.middleName = secondary.middleName;
            // if (!primary.mobilePhone) primary.mobilePhone = secondary.mobilePhone;
            
            // Handle properties that might not exist on the Contact entity
            if ('alternativePhoneNumber' in primary && 'alternativePhoneNumber' in secondary) {
                if (!primary.alternativePhoneNumber) primary.alternativePhoneNumber = secondary.alternativePhoneNumber;
            }
            
            if ('allergies' in primary && 'allergies' in secondary) {
                if (!primary.allergies) primary.allergies = secondary.allergies;
                // Merge arrays if both exist
                if (primary.allergies && secondary.allergies) {
                    primary.allergies = [...new Set([...primary.allergies, ...secondary.allergies])];
                }
            }
            
            if ('medications' in primary && 'medications' in secondary) {
                if (!primary.medications) primary.medications = secondary.medications;
                // Merge arrays if both exist
                if (primary.medications && secondary.medications) {
                    primary.medications = [...new Set([...primary.medications, ...secondary.medications])];
                }
            }
            
            // Safely merge metadata objects
            if (primary.metadata && secondary.metadata) {
                primary.metadata = { ...secondary.metadata, ...primary.metadata };
            } else if (secondary.metadata) {
                primary.metadata = secondary.metadata;
            }

            // Update relationships
            await queryRunner.manager
                .createQueryBuilder()
                .update(Appointment)
                .set({ contactId: primaryId })
                .where("contactId = :secondaryId", { secondaryId })
                .execute();

            await queryRunner.manager
                .createQueryBuilder()
                .update(Document)
                .set({ contactId: primaryId })
                .where("contactId = :secondaryId", { secondaryId })
                .execute();

            await queryRunner.manager
                .createQueryBuilder()
                .update(MedicalHistory)
                .set({ contactId: primaryId })
                .where("contactId = :secondaryId", { secondaryId })
                primary.mergedRecords = [...(primary.mergedRecords || []), secondary];

            // Add to merged records if the property exists
            if ('mergedRecords' in primary) {
                primary.mergedRecords = [...(primary.mergedRecords || []), secondary];
            }

            // Mark secondary as inactive
            secondary.status = 'INACTIVE';

            await queryRunner.manager.save(Contact, primary);
            await queryRunner.manager.save(Contact, secondary);

            await queryRunner.commitTransaction();
            return primary;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Gets all relationships for a contact
     */
    async getRelationships(
        id: string,
        organizationId: string,
        includeInactive: boolean = false
    ) {
        const queryBuilder = this.relationshipRepository.createQueryBuilder('relationship')
            .leftJoinAndSelect('relationship.relatedContact', 'relatedContact')
            .where('relationship.contactId = :id', { id })
            .andWhere('relationship.organizationId = :organizationId', { organizationId });

        if (!includeInactive) {
            queryBuilder.andWhere('relationship.isActive = true');
        }

        return queryBuilder.getMany();
    }

    /**
     * Creates a new relationship between two contacts
     * If the relationship is bidirectional, creates the inverse relationship too
     */
    async createRelationship(
        contactId: string,
        relationshipDto: CreateContactRelationshipDto,
        context: { organizationId: string; userId: string }
    ): Promise<ContactRelationship> {
        // Verify that both contacts exist
        const [contact, relatedContact] = await Promise.all([
            this.findOne(contactId, context.organizationId),
            this.findOne(relationshipDto.relatedContactId, context.organizationId),
        ]);

        // Check if relationship already exists
        const existingRelationship = await this.relationshipRepository.findOne({
            where: {
                contactId,
                relatedContactId: relationshipDto.relatedContactId,
                organizationId: context.organizationId,
            },
        });

        if (existingRelationship) {
            throw new BadRequestException('Relationship already exists between these contacts');
        }

        // Start a transaction for potential bidirectional relationship creation
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Determine inverse type if not provided
            const inverseType = relationshipDto.inverseType || getInverseRelationshipType(relationshipDto.type);

            // Create the primary relationship directly using class instantiation
            const relationship = new ContactRelationship();
            relationship.contactId = contactId;
            relationship.relatedContactId = relationshipDto.relatedContactId;
            relationship.type = relationshipDto.type;
            relationship.inverseType = inverseType ?? RelationshipType.OTHER;
            relationship.notes = relationshipDto.notes ?? '';
            relationship.isPrimary = relationshipDto.isPrimary || false;
            relationship.startDate = relationshipDto.startDate ?? new Date();
            if (relationshipDto.endDate) {
                relationship.endDate = relationshipDto.endDate;
            }
            relationship.metadata = relationshipDto.metadata ?? {};
            relationship.organizationId = context.organizationId;
            relationship.createdById = context.userId;

            const savedRelationship = await queryRunner.manager.save(relationship);

            // Create the inverse relationship if applicable
            if (inverseType && inverseType !== RelationshipType.OTHER) {
                const inverseRelationship = new ContactRelationship();
                inverseRelationship.contactId = relationshipDto.relatedContactId;
                inverseRelationship.relatedContactId = contactId;
                inverseRelationship.type = inverseType;
                inverseRelationship.inverseType = relationshipDto.type;
                inverseRelationship.notes = relationshipDto.notes ?? '';
                inverseRelationship.isPrimary = relationshipDto.isPrimary || false;
                inverseRelationship.startDate = relationshipDto.startDate ?? new Date();
                if (relationshipDto.endDate !== undefined) {
                    inverseRelationship.endDate = relationshipDto.endDate;
                }
                inverseRelationship.metadata = relationshipDto.metadata ?? {};
                inverseRelationship.organizationId = context.organizationId;
                inverseRelationship.createdById = context.userId;

                await queryRunner.manager.save(inverseRelationship);
            }

            await queryRunner.commitTransaction();
            return savedRelationship;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Updates an existing relationship between contacts
     * If the relationship is bidirectional, updates the inverse relationship too
     */
    async updateRelationship(
        id: string,
        updateDto: UpdateContactRelationshipDto,
        context: { organizationId: string; userId: string }
    ): Promise<ContactRelationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: { id, organizationId: context.organizationId },
            relations: ['contact', 'relatedContact'],
        });

        if (!relationship) {
            throw new NotFoundException('Relationship not found');
        }

        // Start a transaction for potential bidirectional relationship update
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Update the primary relationship
            if (updateDto.type !== undefined) {
                relationship.type = updateDto.type;
            }
            if (updateDto.inverseType !== undefined) {
                relationship.inverseType = updateDto.inverseType;
            } else if (updateDto.type !== undefined) {
                // Update inverse type based on new type if type changed
                relationship.inverseType = getInverseRelationshipType(updateDto.type) ?? RelationshipType.OTHER;
            }
            if (updateDto.notes !== undefined) {
                relationship.notes = updateDto.notes;
            }
            if (updateDto.isPrimary !== undefined) {
                relationship.isPrimary = updateDto.isPrimary;
            }
            if (updateDto.isActive !== undefined) {
                relationship.isActive = updateDto.isActive;
            }
            if (updateDto.startDate !== undefined) {
                relationship.startDate = updateDto.startDate;
            }
            if (updateDto.endDate !== undefined) {
                relationship.endDate = updateDto.endDate;
            }
            if (updateDto.metadata !== undefined) {
                relationship.metadata = updateDto.metadata;
            }
            relationship.updatedById = context.userId;

            const savedRelationship = await queryRunner.manager.save(relationship);

            // Find and update the inverse relationship if it exists
            const inverseRelationship = await this.relationshipRepository.findOne({
                where: {
                    contactId: relationship.relatedContactId,
                    relatedContactId: relationship.contactId,
                    organizationId: context.organizationId,
                },
            });

            if (inverseRelationship) {
                // Update the inverse relationship with corresponding values
                if (relationship.inverseType !== undefined) {
                    inverseRelationship.type = relationship.inverseType;
                }
                if (relationship.type !== undefined) {
                    inverseRelationship.inverseType = relationship.type;
                }
                if (updateDto.notes !== undefined) {
                    inverseRelationship.notes = updateDto.notes;
                }
                if (updateDto.isPrimary !== undefined) {
                    inverseRelationship.isPrimary = updateDto.isPrimary;
                }
                if (updateDto.isActive !== undefined) {
                    inverseRelationship.isActive = updateDto.isActive;
                }
                if (updateDto.startDate !== undefined) {
                    inverseRelationship.startDate = updateDto.startDate;
                }
                if (updateDto.endDate !== undefined) {
                    inverseRelationship.endDate = updateDto.endDate;
                }
                if (updateDto.metadata !== undefined) {
                    inverseRelationship.metadata = updateDto.metadata;
                }
                inverseRelationship.updatedById = context.userId;

                await queryRunner.manager.save(inverseRelationship);
            }

            await queryRunner.commitTransaction();
            return savedRelationship;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Deletes a relationship between contacts
     * If the relationship is bidirectional, deletes the inverse relationship too
     */
    async deleteRelationship(
        id: string,
        context: { organizationId: string; userId: string }
    ): Promise<void> {
        const relationship = await this.relationshipRepository.findOne({
            where: { id, organizationId: context.organizationId },
        });

        if (!relationship) {
            throw new NotFoundException('Relationship not found');
        }

        // Start a transaction for potential bidirectional relationship deletion
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Find the inverse relationship if it exists
            const inverseRelationship = await this.relationshipRepository.findOne({
                where: {
                    contactId: relationship.relatedContactId,
                    relatedContactId: relationship.contactId,
                    organizationId: context.organizationId,
                },
            });

            // Delete the primary relationship
            await queryRunner.manager.softRemove(relationship);

            // Delete the inverse relationship if it exists
            if (inverseRelationship) {
                await queryRunner.manager.softRemove(inverseRelationship);
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Gets all contacts related to a contact by a specific relationship type
     */
    async getContactsByRelationshipType(
        contactId: string,
        type: RelationshipType,
        query: { organizationId: string }
    ): Promise<any[]> {
        const relationships = await this.relationshipRepository.find({
            where: {
                contactId,
                type,
                organizationId: query.organizationId,
                isActive: true,
            },
            relations: ['relatedContact'],
        });

        return relationships.map(rel => ({
            relationshipId: rel.id,
            relationshipType: rel.type,
            contact: {
                id: rel.relatedContact.id,
                firstName: rel.relatedContact.firstName,
                lastName: rel.relatedContact.lastName,
                email: rel.relatedContact.email,
                phone: rel.relatedContact.phone,
            },
            notes: rel.notes,
            isPrimary: rel.isPrimary,
            startDate: rel.startDate,
            endDate: rel.endDate,
        }));
    }

    // Legacy method - kept for backward compatibility
    async addRelationship(
        id: string,
        relationshipDto: any,
        context: { organizationId: string; userId: string }
    ) {
        return this.createRelationship(id, relationshipDto, context);
    }

    // Fixed getMedicalHistory method
    async getMedicalHistory(id: string, query: { organizationId: string }) {
        return this.medicalHistoryRepository.find({
            where: {
                contactId: id,
                organizationId: query.organizationId
            },
            order: { date: 'DESC' },
        });
    }

    async getDocuments(id: string, query: { organizationId: string }) {
        return this.documentRepository.find({
            where: {
                contactId: id,
                organizationId: query.organizationId
            },
            order: { createdAt: 'DESC' },
        });
    }

    async addDocument(
        id: string,
        documentDto: any,
        context: { organizationId: string; userId: string }
    ) {
        await this.findOne(id, context.organizationId);

        const document = this.documentRepository.create({
            ...documentDto,
            contactId: id,
            organizationId: context.organizationId,
            createdById: context.userId,
        });

        return this.documentRepository.save(document);
    }

    async getStatistics(query: { organizationId: string }) {
        const stats = await this.contactRepository
            .createQueryBuilder('contact')
            .where('contact.organizationId = :organizationId', { organizationId: query.organizationId })
            .select([
                'COUNT(*) as total',
                'COUNT(CASE WHEN contact.type = \'PATIENT\' THEN 1 END) as patients',
                'COUNT(CASE WHEN contact.status = \'ACTIVE\' THEN 1 END) as active',
                'COUNT(CASE WHEN contact.createdAt >= NOW() - INTERVAL \'30 days\' THEN 1 END) as newLast30Days',
            ])
            .getRawOne();

        return stats;
    }

    async importContacts(
        importDto: any,
        context: { organizationId: string; userId: string }
    ) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const contacts = importDto.contacts.map((contactData: any) => ({
                ...contactData,
                organizationId: context.organizationId,
                createdById: context.userId,
            }));

            const savedContacts = await queryRunner.manager.save(Contact, contacts);
            await queryRunner.commitTransaction();

            return {
                imported: savedContacts.length,
                contacts: savedContacts,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async exportContacts(
        exportDto: any,
        context: { organizationId: string; userId: string }
    ) {
        const queryBuilder = this.contactRepository.createQueryBuilder('contact')
            .where('contact.organizationId = :organizationId', { organizationId: context.organizationId });

        if (exportDto.filters) {
            // Apply filters similar to findAll method
        }

        const contacts = await queryBuilder.getMany();

        // Transform contacts for export
        const exportData = contacts.map(contact => ({
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            type: contact.type,
            // Add other fields as needed
        }));

        return {
            exported: exportData.length,
            data: exportData,
        };
    }
}