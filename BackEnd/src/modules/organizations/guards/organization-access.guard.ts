import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '@/modules/users/enums/role.enum';

@Injectable()
export class OrganizationAccessGuard implements CanActivate {
    private readonly logger = new Logger(OrganizationAccessGuard.name);

    constructor(
        private reflector: Reflector,
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const user = request.user as User;
            const organizationId = this.extractOrganizationId(request);

            // Skip check if no organization ID is present
            if (!organizationId) {
                return true;
            }

            // Super admins always have access
            if (user.role === Role.SUPER_ADMIN) {
                return true;
            }

            // Check if user has any access to the organization
            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId },
                relations: ['members']
            });

            if (!organization) {
                this.logger.warn(`Organization ${organizationId} not found`);
                return false;
            }

            const member = organization.members.find((m: { userId: string; }) => m.userId === user.id);
            if (!member) {
                this.logger.warn(
                    `User ${user.id} attempted to access organization ${organizationId} without membership`
                );
                return false;
            }

            // Store organization and member info in request for later use
            request.organization = organization;
            request.organizationMember = member;

            return true;
        } catch (error) {
            this.logger.error('Error in organization access guard:', error);
            return false;
        }
    }

    private extractOrganizationId(request: any): string | null {
        // Try to get organization ID from various places
        return (
            request.params.organizationId ||
            request.body.organizationId ||
            request.query.organizationId ||
            request.headers['x-organization-id']
        );
    }
}