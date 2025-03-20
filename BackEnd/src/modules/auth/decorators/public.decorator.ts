// src/modules/auth/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Public route decorator
 * Use this decorator to mark a route as public (no authentication required)
 * Example: @Public()
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);