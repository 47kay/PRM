import { ContactsService } from '../services/contacts.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { ContactQueryDto } from '../dto/contact-query.dto';
import { MergeContactsDto } from '../dto/merge-contacts.dto';
import { Contact } from '../entities/contact.entity';
import { CustomRequest } from '../../../interfaces/request.interface';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    create(createContactDto: CreateContactDto, req: CustomRequest): Promise<Contact>;
    findAll(query: ContactQueryDto, req: CustomRequest): Promise<import("nestjs-typeorm-paginate").Pagination<Contact, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    search(searchTerm: string, query: ContactQueryDto, req: CustomRequest): Promise<import("nestjs-typeorm-paginate").Pagination<unknown, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    findOne(id: string, req: CustomRequest): Promise<Contact>;
    update(id: string, updateContactDto: UpdateContactDto, req: CustomRequest): Promise<Contact>;
    remove(id: string, req: CustomRequest): Promise<void>;
    merge(primaryId: string, mergeContactsDto: MergeContactsDto, req: CustomRequest): Promise<Contact>;
    getRelationships(id: string, req: CustomRequest): Promise<ContactRelationship[]>;
    addRelationship(id: string, relationshipDto: any, req: CustomRequest): Promise<any>;
    getMedicalHistory(id: string, query: any, req: CustomRequest): Promise<MedicalHistory[]>;
    getAppointments(id: string, query: any, req: CustomRequest): Promise<import("../../appointments/appointments.module").Appointment[]>;
    getDocuments(id: string, query: any, req: CustomRequest): Promise<Document[]>;
    addDocument(id: string, documentDto: any, req: CustomRequest): Promise<any>;
    getStatistics(query: any, req: CustomRequest): Promise<any>;
    importContacts(importDto: any, req: CustomRequest): Promise<{
        imported: any;
        contacts: any;
    }>;
    exportContacts(exportDto: any, req: CustomRequest): Promise<{
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
