// src/common/decorators/auth.decorator.ts

import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Role } from '../../modules/users/enums/role.enum';

export const AUTH_ROLES_KEY = 'roles';
export const AUTH_ORG_KEY = 'requireOrganization';

export interface AuthOptions {
    roles?: Role[];
    requireOrganization?: boolean;
}

export function Auth(options: AuthOptions = {}) {
    const { roles = [], requireOrganization = true } = options;

    return applyDecorators(
        SetMetadata(AUTH_ROLES_KEY, roles),
        SetMetadata(AUTH_ORG_KEY, requireOrganization),
        UseGuards(JwtAuthGuard, RolesGuard),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({ description: 'Unauthorized' })
    );
}

// Public routes decorator
export function Public() {
    return SetMetadata('isPublic', true);
}

// Organization required decorator
export function RequireOrganization() {
    return SetMetadata(AUTH_ORG_KEY, true);
}

// Current user decorator
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    }
);

// Current organization decorator
export const CurrentOrganization = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const organization = request.organization;

        return data ? organization?.[data] : organization;
    }
);

// Example usage:
/*
@Auth({ roles: [Role.ADMIN] })
@Get('admin-only')
adminOnlyEndpoint() {
    return 'Only admins can access this';
}

@Auth({ roles: [Role.DOCTOR, Role.ADMIN] })
@Get('doctors-and-admins')
doctorsAndAdminsEndpoint() {
    return 'Doctors and admins can access this';
}

@Public()
@Get('public')
publicEndpoint() {
    return 'Anyone can access this';
}

@Get('user-info')
getUserInfo(@CurrentUser() user: User) {
    return user;
}

@Get('org-info')
getOrgInfo(@CurrentOrganization() organization: Organization) {
    return organization;
}
*/