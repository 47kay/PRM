import { Repository, DataSource } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { ContactQueryDto } from '../dto/contact-query.dto';
import { ContactRelationship } from '../entities/contact-relationship.entity';
import { MedicalHistory } from '../../medical-history/entities/medical-history.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Document } from '../../documents/entities/document.entity';
export declare class ContactsService {
    private readonly contactRepository;
    private readonly relationshipRepository;
    private readonly medicalHistoryRepository;
    private readonly appointmentRepository;
    private readonly documentRepository;
    private readonly dataSource;
    constructor(contactRepository: Repository<Contact>, relationshipRepository: Repository<ContactRelationship>, medicalHistoryRepository: Repository<MedicalHistory>, appointmentRepository: Repository<Appointment>, documentRepository: Repository<Document>, dataSource: DataSource);
    create(data: CreateContactDto & {
        organizationId: string;
        createdBy: string;
    }): Promise<Contact>;
    findAll(query: ContactQueryDto & {
        organizationId: string;
    }): Promise<Pagination<Contact>>;
    search(searchTerm: string, query: ContactQueryDto & {
        organizationId: string;
    }): Promise<Pagination<unknown, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    findOne(id: string, organizationId: string): Promise<Contact>;
    update(id: string, data: UpdateContactDto & {
        organizationId: string;
        updatedBy: string;
    }): Promise<Contact>;
    remove(id: string, organizationId: string): Promise<void>;
    merge(primaryId: string, secondaryId: string, context: {
        organizationId: string;
        userId: string;
    }): Promise<Contact>;
    getRelationships(id: string, organizationId: string): Promise<ContactRelationship[]>;
    addRelationship(id: string, relationshipDto: any, context: {
        organizationId: string;
        userId: string;
    }): Promise<any>;
    getMedicalHistory(id: string, query: {
        organizationId: string;
    }): Promise<MedicalHistory[]>;
    getAppointments(id: string, query: {
        organizationId: string;
    }): Promise<Appointment[]>;
    getDocuments(id: string, query: {
        organizationId: string;
    }): Promise<Document[]>;
    addDocument(id: string, documentDto: any, context: {
        organizationId: string;
        userId: string;
    }): Promise<any>;
    getStatistics(query: {
        organizationId: string;
    }): Promise<any>;
    importContacts(importDto: any, context: {
        organizationId: string;
        userId: string;
    }): Promise<{
        imported: any;
        contacts: any;
    }>;
    exportContacts(exportDto: any, context: {
        organizationId: string;
        userId: string;
    }): Promise<{
        exported: number;
        data: {
            id: string;
            firstName: string;
            lastName: string;
            email: string | undefined;
            phoneNumber: string | undefined;
            type: import("../entities/contact.entity").ContactType;
        }[];
    }>;
}
