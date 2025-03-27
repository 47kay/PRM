import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationQueryDto } from '../dto/organization-query.dto';
import { AddUserDto } from '../dto/add-user.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { DomainVerificationService } from '../../domain/services/domain-verification.service';
import { EmailService } from '../../../shared/services/email.service';
import { StorageService } from '../../storage/services/storage.service';
export declare class OrganizationsService {
    private readonly organizationRepository;
    private readonly userRepository;
    private readonly auditLogRepository;
    private readonly domainVerificationService;
    private readonly emailService;
    private readonly storageService;
    getMemberContext(organizationId: string, id: string): any;
    findById(organizationId: string): void;
    constructor(organizationRepository: Repository<Organization>, userRepository: Repository<User>, auditLogRepository: Repository<AuditLog>, domainVerificationService: DomainVerificationService, emailService: EmailService, storageService: StorageService);
    create(createOrganizationDto: CreateOrganizationDto & {
        createdById: string;
    }): Promise<Organization>;
    findAll(query: OrganizationQueryDto): Promise<{
        items: Organization[];
        total: number;
    }>;
    findOne(id: string): Promise<Organization>;
    update(id: string, updateOrganizationDto: UpdateOrganizationDto & {
        updatedBy: string;
    }): Promise<Organization>;
    remove(id: string): Promise<void>;
    addUser(id: string, addUserDto: AddUserDto): Promise<User>;
    removeUser(id: string, userId: string): Promise<void>;
    getAdminCount(organizationId: string): Promise<number>;
    updateSubscription(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Organization>;
    getStatistics(id: string): Promise<any>;
    verifyDomain(id: string, domain: string): Promise<boolean>;
    getAuditLogs(id: string, query: any): Promise<{
        items: AuditLog[];
        total: number;
    }>;
    private generateUniqueSlug;
    private getDefaultSettings;
    private createAuditLog;
    private sendWelcomeEmail;
    private getStorageUsage;
    private verifyDomainOwnership;
}
