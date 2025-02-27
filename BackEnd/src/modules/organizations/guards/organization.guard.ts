import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationsService } from '../services/organizations.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/enums/role.enum';

@Injectable()
export class OrganizationGuard implements CanActivate {
  private readonly logger = new Logger(OrganizationGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const user = request.user as User;

      // Handle case where no user is authenticated
      if (!user) {
        throw new UnauthorizedException('No authenticated user found');
      }

      // Super admins bypass organization checks
      if (user.role === Role.SUPER_ADMIN) {
        return true;
      }

      // Get organization ID from request params or query
      const organizationId = this.extractOrganizationId(request);

      // If no organization ID is found, check if the endpoint is marked as optional
      if (!organizationId) {
        const isOptional = this.reflector.get<boolean>('optionalOrganization', context.getHandler());
        return isOptional || false;
      }

      // Verify user's organization access
      const hasAccess = await this.verifyOrganizationAccess(user.id, organizationId);
      if (!hasAccess) {
        throw new ForbiddenException('User does not have access to this organization');
      }

      // Get organization details and member context
      const [organization, member] = await Promise.all([
        this.organizationsService.findOne(organizationId),
        this.organizationsService.getMemberContext(organizationId, user.id)
      ]);

      if (!organization) {
        throw new ForbiddenException('Organization not found');
      }

      if (!member) {
        throw new ForbiddenException('User is not a member of this organization');
      }

      // Attach organization and member context to request
      request.organization = organization;
      request.organizationMember = member;

      return true;
    } catch (error) {
      this.logger.error('Error in organization guard:', error);
      throw error;
    }
  }

  private extractOrganizationId(request: any): string | undefined {
    // Try to get organization ID from different places in the request
    return (
      request.params?.organizationId ||
      request.body?.organizationId ||
      request.query?.organizationId ||
      this.extractFromPath(request.path)
    );
  }

  private extractFromPath(path: string): string | undefined {
    // Extract organization ID from URL path if it follows the pattern /organizations/{id}/...
    const matches = path.match(/\/organizations\/([^\/]+)/);
    return matches?.[1];
  }

  private async verifyOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
    try {
      // Check if user is a member of the organization
      const membership = await this.organizationsService.getMemberContext(organizationId, userId);
      
      if (!membership) {
        return false;
      }

      // Check if membership is active
      if (!membership.isActive) {
        return false;
      }

      // Check if user has required roles/permissions
      // This can be expanded based on your requirements
      return true;
    } catch (error) {
      this.logger.error(`Error verifying organization access for user ${userId}:`, error);
      return false;
    }
  }
}

// Decorator to mark endpoints where organization context is optional
export const OptionalOrganization = () => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (key) {
      if (descriptor) {
        SetMetadata('optionalOrganization', true)(target, key, descriptor);
      }
    }
    return descriptor;
  };
};