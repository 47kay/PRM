// src/decorators/permissions.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Permissions required for this route
 * @param permissions list of permissions required
 * @returns decorator function
 */
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);