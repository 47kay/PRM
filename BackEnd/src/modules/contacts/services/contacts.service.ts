// src/modules/contacts/services/contacts.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, DataSource } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { ContactQueryDto } from '../dto/contact-query.dto';
import { ContactRelationship } from '../entities/contact-relationship.entity';
import { MedicalHistory } from '../../medical-history/entities/medical-history.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Document } from '../../documents/entities/document.entity';

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
    ) {}

    async create(data: CreateContactDto & { organizationId: string; createdBy: string }): Promise<Contact> {
        const existingContact = await this.contactRepository.findOne({
            where: [
                { email: data.email, organizationId: data.organizationId },
                { phoneNumber: data.phoneNumber, organizationId: data.organizationId },
            ],
        });

        if (existingContact) {
            throw new ConflictException('Contact with this email or phone number already exists');
        }

        const contact = this.contactRepository.create(data);
        return this.contactRepository.save(contact);
    }

    async findAll(query: ContactQueryDto & { organizationId: string }): Promise<Pagination<Contact>> {
        const { organizationId, search, type, isActive, page = 1, limit = 10, ...filters } = query;

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

        return paginate(queryBuilder, { page, limit });
    }

    async search(searchTerm: string, query: ContactQueryDto & { organizationId: string }) {
        const { organizationId, page = 1, limit = 10 } = query;

        const queryBuilder = this.contactRepository.createQueryBuilder('contact')
            .where('contact.organizationId = :organizationId', { organizationId })
            .andWhere(
                '(LOWER(contact.firstName) LIKE LOWER(:search) OR LOWER(contact.lastName) LIKE LOWER(:search) OR LOWER(contact.email) LIKE LOWER(:search) OR contact.phoneNumber LIKE :search)',
                { search: `%${searchTerm}%` }
            );

        return paginate(queryBuilder, { page, limit });
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
        data: UpdateContactDto & { organizationId: string; updatedBy: string }
    ): Promise<Contact> {
        const contact = await this.findOne(id, data.organizationId);

        // Check unique constraints if email or phone is being updated
        if (data.email || data.phoneNumber) {
            const existingContact = await this.contactRepository.findOne({
                where: [
                    { email: data.email, organizationId: data.organizationId, id: Not(id) },
                    { phoneNumber: data.phoneNumber, organizationId: data.organizationId, id: Not(id) },
                ],
            });

            if (existingContact) {
                throw new ConflictException('Contact with this email or phone number already exists');
            }
        }

        Object.assign(contact, data);
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
            if (!primary.alternativePhoneNumber) primary.alternativePhoneNumber = secondary.alternativePhoneNumber;
            if (!primary.allergies) primary.allergies = secondary.allergies;
            if (!primary.medications) primary.medications = secondary.medications;
            
            // Merge arrays and objects
            primary.allergies = [...new Set([...(primary.allergies || []), ...(secondary.allergies || [])])];
            primary.medications = [...new Set([...(primary.medications || []), ...(secondary.medications || [])])];
            primary.customFields = { ...secondary.customFields, ...primary.customFields };

            // Update relationships
            await queryRunner.manager.update(
                Appointment,
                { contactId: secondaryId },
                { contactId: primaryId }
            );

            await queryRunner.manager.update(
                Document,
                { contactId: secondaryId },
                { contactId: primaryId }
            );

            await queryRunner.manager.update(
                MedicalHistory,
                { contactId: secondaryId },
                { contactId: primaryId }
            );

            // Add to merged records
            primary.mergedRecords = [...(primary.mergedRecords || []), secondary];

            // Save changes and mark secondary as inactive
            secondary.isActive = false;
            
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

    async getRelationships(id: string, organizationId: string) {
        const relationships = await this.relationshipRepository.find({
            where: { contactId: id, organizationId },
            relations: ['relatedContact'],
        });

        return relationships;
    }

    async addRelationship(
        id: string,
        relationshipDto: any,
        context: { organizationId: string; userId: string }
    ) {
        const contact = await this.findOne(id, context.organizationId);
        const relatedContact = await this.findOne(relationshipDto.relatedContactId, context.organizationId);

        const relationship = this.relationshipRepository.create({
            contact,
            relatedContact,
            type: relationshipDto.type,
            notes: relationshipDto.notes,
            organizationId: context.organizationId,
            createdById: context.userId,
        });

        return this.relationshipRepository.save(relationship);
    }

    async getMedicalHistory(id: string, query: { organizationId: string }) {
        return this.medicalHistoryRepository.find({
            where: { contactId: id, organizationId: query.organizationId },
            order: { date: 'DESC' },
        });
    }

    async getAppointments(id: string, query: { organizationId: string }) {
        return this.appointmentRepository.find({
            where: { contactId: id, organizationId: query.organizationId },
            order: { startTime: 'DESC' },
        });
    }

    async getDocuments(id: string, query: { organizationId: string }) {
        return this.documentRepository.find({
            where: { contactId: id, organizationId: query.organizationId },
            order: { createdAt: 'DESC' },
        });
    }

    async addDocument(
        id: string,
        documentDto: any,
        context: { organizationId: string; userId: string }
    ) {
        const contact = await this.findOne(id, context.organizationId);
        
        const document = this.documentRepository.create({
            ...documentDto,
            contact,
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
                'COUNT(CASE WHEN contact.isActive = true THEN 1 END) as active',
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
            const contacts = importDto.contacts.map(contactData => ({
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
            phoneNumber: contact.phoneNumber,
            type: contact.type,
            // Add other fields as needed
        }));

        return {
            exported: exportData.length,
            data: exportData,
        };
    }
}