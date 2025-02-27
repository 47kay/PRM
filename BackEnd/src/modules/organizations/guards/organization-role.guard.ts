import { Injectable, CanActivate, ExecutionContext, Logger, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/enums/role.enum';

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface RoleMetadata {
  roles: OrganizationRole[];
  allowSelf?: boolean;
  checkResourceOwner?: boolean;
}

@Injectable()
export class OrganizationRoleGuard implements CanActivate {
  private readonly logger = new Logger(OrganizationRoleGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const roles = this.reflector.get<RoleMetadata>('roles', context.getHandler());

      // If no roles are specified, allow access
      if (!roles) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user as User;
      const member = request.organizationMember;

      // Super admins bypass role checks
      if (user.role === Role.SUPER_ADMIN) {
        return true;
      }

      // Ensure we have organization member info
      if (!member) {
        this.logger.warn(
          `Organization member info not found for user ${user.id}. ` +
          'Make sure OrganizationAccessGuard runs before this guard.'
        );
        return false;
      }

      // Check if user has required role
      if (!roles.roles.includes(member.role as OrganizationRole)) {
        // Check for self-access if allowed
        if (roles.allowSelf) {
          const targetUserId = this.extractTargetUserId(request);
          if (targetUserId === user.id) {
            return true;
          }
        }

        // Check resource ownership if enabled
        if (roles.checkResourceOwner) {
          const hasOwnership = await this.checkResourceOwnership(request, user.id);
          if (hasOwnership) {
            return true;
          }
        }

        this.logger.warn(
          `User ${user.id} with role ${member.role} attempted to access resource ` +
          `requiring roles: ${roles.roles.join(', ')}`
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error in organization role guard:', error);
      return false;
    }
  }

  private extractTargetUserId(request: any): string | null {
    return (
      request.params.userId ||
      request.body.userId ||
      request.query.userId
    );
  }

  private async checkResourceOwnership(request: any, userId: string): Promise<boolean> {
    try {
      const resource = request.resource;
      if (!resource) {
        return false;
      }

      // Check common ownership fields
      const ownerId = resource.userId || resource.createdBy || resource.ownerId;
      return ownerId === userId;
    } catch (error) {
      this.logger.error('Error checking resource ownership:', error);
      return false;
    }
  }
}

// Export the decorator for specifying required roles
export const RequireOrganizationRoles = (metadata: RoleMetadata): MethodDecorator => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    SetMetadata('roles', metadata)(target, propertyKey, descriptor);
    return descriptor;
  };
};