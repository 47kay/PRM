// src/modules/auth/guards/roles.guard.ts

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(
        private reflector: Reflector,
        private authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Get required roles and permissions from decorators
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no roles or permissions are required, allow access
        if (!requiredRoles && !requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not found in request');
        }

        try {
            // Check roles
            if (requiredRoles?.length > 0) {
                const hasRole = this.matchRoles(requiredRoles, user.role);
                if (!hasRole) {
                    this.logger.warn(
                        `User ${user.id} with role ${user.role} attempted to access resource requiring roles: ${requiredRoles.join(
                            ', ',
                        )}`,
                    );
                    return false;
                }
            }

            // Check permissions
            if (requiredPermissions?.length > 0) {
                const hasPermissions = await this.matchPermissions(
                    requiredPermissions,
                    user,
                );
                if (!hasPermissions) {
                    this.logger.warn(
                        `User ${user.id} attempted to access resource requiring permissions: ${requiredPermissions.join(
                            ', ',
                        )}`,
                    );
                    return false;
                }
            }

            // Handle organization-specific permissions
            if (request.params.organizationId) {
                const hasOrgAccess = await this.authService.checkOrganizationAccess(
                    user.id,
                    request.params.organizationId,
                );
                if (!hasOrgAccess) {
                    this.logger.warn(
                        `User ${user.id} attempted to access organization ${request.params.organizationId} without permission`,
                    );
                    return false;
                }
            }

            return true;
        } catch (error) {
            this.logger.error(`Error in roles guard: ${error.message}`, error.stack);
            return false;
        }
    }

    private matchRoles(requiredRoles: Role[], userRole: Role): boolean {
        // Super admin has access to everything
        if (userRole === Role.SUPER_ADMIN) {
            return true;
        }

        return requiredRoles.includes(userRole);
    }

    private async matchPermissions(
        requiredPermissions: string[],
        user: any,
    ): Promise<boolean> {
        // Get user permissions (could be cached)
        const userPermissions = await this.authService.getUserPermissions(user.id);

        // Super admin has all permissions
        if (user.role === Role.SUPER_ADMIN) {
            return true;
        }

        // Check if user has all required permissions
        return requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
        );
    }

    // Helper method to check resource ownership
    private async checkResourceOwnership(
        user: any,
        resourceId: string,
        resourceType: string,
    ): Promise<boolean> {
        // Implement resource ownership check logic
        return this.authService.checkResourceOwnership(
            user.id,
            resourceId,
            resourceType,
        );
    }
}