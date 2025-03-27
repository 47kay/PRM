import { OrganizationsService } from '../services/organizations.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationQueryDto } from '../dto/organization-query.dto';
import { AddUserDto } from '../dto/add-user.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { CustomRequest } from '../../../interfaces/request.interface';
import { User } from '../../users/entities/user.entity';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    create(createOrganizationDto: CreateOrganizationDto, req: CustomRequest): Promise<import("../entities/organization.entity").Organization>;
    findAll(query: OrganizationQueryDto): Promise<{
        items: import("../entities/organization.entity").Organization[];
        total: number;
    }>;
    getCurrentOrganization(req: CustomRequest): Promise<import("../entities/organization.entity").Organization>;
    findOne(id: string): Promise<import("../entities/organization.entity").Organization>;
    update(id: string, updateOrganizationDto: UpdateOrganizationDto, req: CustomRequest): Promise<import("../entities/organization.entity").Organization>;
    remove(id: string): Promise<void>;
    addUser(id: string, addUserDto: AddUserDto, req: CustomRequest): Promise<User>;
    removeUser(id: string, userId: string, req: CustomRequest): Promise<void>;
    updateSubscription(id: string, updateSubscriptionDto: UpdateSubscriptionDto, req: CustomRequest): Promise<import("../entities/organization.entity").Organization>;
    getStatistics(id: string, req: CustomRequest): Promise<any>;
    verifyDomain(id: string, domain: string, req: CustomRequest): Promise<boolean>;
    getAuditLogs(id: string, query: any, req: CustomRequest): Promise<{
        items: import("../../audit/entities/audit-log.entity").AuditLog[];
        total: number;
    }>;
}
