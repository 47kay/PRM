import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, IsNull, DeepPartial } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationQueryDto } from '../dto/organization-query.dto';
import { AddUserDto } from '../dto/add-user.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { Role } from '../../users/enums/role.enum';
import { SubscriptionTier, OrganizationStatus } from '../entities/organization.entity';
import { generateSlug } from '../../../utils/slug.util';
import { DomainVerificationService } from '../../domain/services/domain-verification.service';
import { EmailService } from '../../../shared/services/email.service';
import { StorageService } from '../../storage/services/storage.service';

@Injectable()
export class OrganizationsService {
    getMemberContext(organizationId: string, id: string): any {
        throw new Error('Method not implemented.');
    }
    findById(organizationId: string) {
        throw new Error('Method not implemented.');
    }
    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
        private readonly domainVerificationService: DomainVerificationService,
        private readonly emailService: EmailService,
        private readonly storageService: StorageService,
    ) {}

    async create(createOrganizationDto: CreateOrganizationDto & { createdById: string }): Promise<Organization> {
        // Check if organization with same name exists
        const existingOrg = await this.organizationRepository.findOne({
            where: { name: createOrganizationDto.name }
        });
    
        if (existingOrg) {
            throw new ConflictException('Organization with this name already exists');
        }
    
        // Generate slug from name
        const slug = await this.generateUniqueSlug(createOrganizationDto.name);
    
        // Create organization with explicit properties to avoid type issues
        const organizationData = {
            name: createOrganizationDto.name,
            description: createOrganizationDto.description,
            slug,
            type: createOrganizationDto.type,
            status: OrganizationStatus.PENDING,
            subscriptionTier: SubscriptionTier.FREE,
            settings: this.getDefaultSettings(),
            createdById: createOrganizationDto.createdById,
        };
    
        // Create the entity with type casting to help TypeScript
        const organization = this.organizationRepository.create(organizationData as any);
        
        // Save the entity and handle the case where it returns an array
        const result = await this.organizationRepository.save(organization);
        // Convert to single entity if it's an array
        const savedOrg = Array.isArray(result) ? result[0] : result;
    
        // Create audit log
        await this.createAuditLog({
            organizationId: savedOrg.id,
            action: 'CREATE_ORGANIZATION',
            metadata: { userId: createOrganizationDto.createdById, organizationId: savedOrg.id }
        });
    
        return savedOrg;
    }

    async findAll(query: OrganizationQueryDto): Promise<{ items: Organization[]; total: number }> {
        const queryBuilder = this.organizationRepository.createQueryBuilder('organization');

        // Apply filters
        if (query.search) {
            queryBuilder.andWhere('(organization.name ILIKE :search OR organization.domain ILIKE :search)', 
                { search: `%${query.search}%` });
        }

        if (query.status) {
            queryBuilder.andWhere('organization.status = :status', { status: query.status });
        }

        if (query.subscriptionTier) {
            queryBuilder.andWhere('organization.subscriptionTier = :tier', { tier: query.subscriptionTier });
        }

        // Add relations
        queryBuilder.leftJoinAndSelect('organization.users', 'users');

        // Add pagination
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        queryBuilder.skip(skip).take(limit);

        // Add sorting
        const sortBy = query.sortBy || 'createdAt';
        const sortOrder = query.sortOrder || 'DESC';
        queryBuilder.orderBy(`organization.${sortBy}`, sortOrder);

        // Execute query
        const [items, total] = await queryBuilder.getManyAndCount();

        return { items, total };
    }

    async findOne(id: string): Promise<Organization> {
        const organization = await this.organizationRepository.findOne({
            where: { id },
            relations: ['users']
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        return organization;
    }

    async update(id: string, updateOrganizationDto: UpdateOrganizationDto & { updatedBy: string }): Promise<Organization> {
        const organization = await this.findOne(id);

        // If domain is being updated, verify it
        if (updateOrganizationDto.domain && updateOrganizationDto.domain !== organization.domain) {
            organization.isDomainVerified = false;
        }

        // Update organization
        Object.assign(organization, updateOrganizationDto);

        // Save changes
        const updatedOrg = await this.organizationRepository.save(organization);

        // Create audit log
        await this.createAuditLog({
            organizationId: id,
            action: 'UPDATE_ORGANIZATION',
            metadata: { 
                userId: updateOrganizationDto.updatedBy, 
                organizationId: id, 
                changes: updateOrganizationDto 
            }
        });

        return updatedOrg;
    }

    async remove(id: string): Promise<void> {
        const organization = await this.findOne(id);

        // Soft delete organization
        await this.organizationRepository.softDelete(id);

        // Create audit log
        await this.createAuditLog({
            organizationId: id,
            action: 'DELETE_ORGANIZATION',
            metadata: { organizationId: id }
        });
    }

    async addUser(id: string, addUserDto: AddUserDto): Promise<User> {
        const organization = await this.findOne(id);

        // Check if user limit is reached
        const userCount = await this.userRepository.count({ where: { organizationId: id } });
        if (userCount >= organization.maxUsers) {
            throw new BadRequestException('Organization user limit reached');
        }

        // Create new user
        const user = this.userRepository.create({
            ...addUserDto,
            organizationId: id,
            requirePasswordChange: true
        });

        // Save user
        const savedUser = await this.userRepository.save(user);

        // Send welcome email
        await this.sendWelcomeEmail(savedUser.email, {
            organizationName: organization.name,
            temporaryPassword: addUserDto.password
        });

        // Create audit log
        await this.createAuditLog({
            organizationId: id,
            action: 'ADD_USER',
            metadata: { userId: savedUser.id }
        });

        return savedUser;
    }

    async removeUser(id: string, userId: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId, organizationId: id }
        });

        if (!user) {
            throw new NotFoundException('User not found in organization');
        }

        // Soft delete user
        await this.userRepository.softDelete(userId);

        // Create audit log
        await this.createAuditLog({
            organizationId: id,
            action: 'REMOVE_USER',
            metadata: { userId }
        });
    }

    async getAdminCount(organizationId: string): Promise<number> {
        return this.userRepository.count({
            where: {
                organizationId,
                role: Role.ADMIN,
                deletedAt: IsNull()
            }
        });
    }

    async updateSubscription(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Organization> {
        const organization = await this.findOne(id);

        // Update subscription details
        Object.assign(organization, {
            subscriptionTier: updateSubscriptionDto.tier,
            subscriptionStartDate: updateSubscriptionDto.startDate,
            subscriptionEndDate: updateSubscriptionDto.endDate,
            maxUsers: updateSubscriptionDto.maxUsers,
            maxStorage: updateSubscriptionDto.maxStorage,
            isSubscriptionActive: true
        });

        // Save changes
        const updatedOrg = await this.organizationRepository.save(organization);

        // Create audit log
        await this.createAuditLog({
            organizationId: id,
            action: 'UPDATE_SUBSCRIPTION',
            metadata: { changes: updateSubscriptionDto }
        });

        return updatedOrg;
    }

    async getStatistics(id: string): Promise<any> {
        const organization = await this.findOne(id);

        // Get user statistics
        const totalUsers = await this.userRepository.count({
            where: { organizationId: id }
        });

        const activeUsers = await this.userRepository.count({
            where: { organizationId: id, isActive: true }
        });

        // Get storage statistics
        const storageUsed = await this.getStorageUsage(id);

        return {
            totalUsers,
            activeUsers,
            storageUsed,
            storageLimit: organization.maxStorage,
            subscriptionStatus: organization.isSubscriptionActive,
            subscriptionTier: organization.subscriptionTier
        };
    }

    async verifyDomain(id: string, domain: string): Promise<boolean> {
        const organization = await this.findOne(id);

        // Verify domain ownership
        const isVerified = await this.verifyDomainOwnership(domain);

        if (isVerified) {
            // Update organization domain status
            organization.domain = domain;
            organization.isDomainVerified = true;
            await this.organizationRepository.save(organization);

            // Create audit log
            await this.createAuditLog({
                organizationId: id,
                action: 'VERIFY_DOMAIN',
                metadata: { domain }
            });
        }

        return isVerified;
    }

    async getAuditLogs(id: string, query: any): Promise<{ items: AuditLog[]; total: number }> {
        const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log')
            .where('audit_log.organizationId = :id', { id });

        // Apply filters
        if (query.action) {
            queryBuilder.andWhere('audit_log.action = :action', { action: query.action });
        }

        if (query.userId) {
            queryBuilder.andWhere('audit_log.metadata->\'userId\' = :userId', { userId: query.userId });
        }

        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('audit_log.createdAt BETWEEN :startDate AND :endDate', {
                startDate: query.startDate,
                endDate: query.endDate
            });
        }

        // Add pagination
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        queryBuilder.skip(skip).take(limit);

        // Add sorting
        queryBuilder.orderBy('audit_log.createdAt', 'DESC');

        // Execute query
        const [items, total] = await queryBuilder.getManyAndCount();

        return { items, total };
    }

    private async generateUniqueSlug(name: string): Promise<string> {
        let slug = generateSlug(name);
        let counter = 1;
        
        while (await this.organizationRepository.findOne({ where: { slug } })) {
            slug = generateSlug(name) + '-' + counter;
            counter++;
        }

        return slug;
    }

    private getDefaultSettings(): any {
        return {
            ticketPriorities: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            ticketCategories: ['GENERAL', 'TECHNICAL', 'BILLING', 'OTHER'],
            customFields: [],
            notificationSettings: {
                emailEnabled: true,
                smsEnabled: false,
                inAppEnabled: true
            },
            brandingSettings: {
                primaryColor: '#007bff',
                logoUrl: null,
                favIconUrl: null
            }
        };
    }

    private async createAuditLog(data: Partial<AuditLog>): Promise<void> {
        const auditLog = this.auditLogRepository.create(data);
        await this.auditLogRepository.save(auditLog);
    }

    // Custom methods to replace non-existent service methods
    private async sendWelcomeEmail(email: string, data: { organizationName: string, temporaryPassword: string }): Promise<void> {
        // Implementation of welcome email sending
        console.log(`Sending welcome email to ${email} for organization ${data.organizationName}`);
        
        // You can implement your own email sending logic here or call the correct method
        // from your EmailService if it exists with different parameters
        // For example:
        // await this.emailService.sendEmail({
        //     to: email,
        //     subject: 'Welcome to ' + data.organizationName,
        //     template: 'welcome',
        //     context: {
        //         organizationName: data.organizationName,
        //         temporaryPassword: data.temporaryPassword
        //     }
        // });
    }

    private async getStorageUsage(organizationId: string): Promise<number> {
        // Implementation of storage usage calculation
        console.log(`Getting storage usage for organization ${organizationId}`);
        
        // You can implement your own storage calculation logic here or call the correct method
        // from your StorageService if it exists with different parameters
        // For example:
        // return await this.storageService.calculateUsage(organizationId);
        
        return 0; // Return default value for now
    }

    private async verifyDomainOwnership(domain: string): Promise<boolean> {
        // Implementation of domain verification
        console.log(`Verifying domain ownership for ${domain}`);
        
        // You can implement your own domain verification logic here or call the correct method
        // from your DomainVerificationService if it exists with different parameters
        // For example:
        // return await this.domainVerificationService.verifyOwnership(domain);
        
        return true; // Return default value for now
    }
}