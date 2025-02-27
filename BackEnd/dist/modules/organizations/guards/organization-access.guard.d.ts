import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
export declare class OrganizationAccessGuard implements CanActivate {
    private reflector;
    private organizationRepository;
    private readonly logger;
    constructor(reflector: Reflector, organizationRepository: Repository<Organization>);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractOrganizationId;
}
