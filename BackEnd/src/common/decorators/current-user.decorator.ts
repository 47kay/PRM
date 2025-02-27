import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/users/entities/user.entity';

/**
 * Custom decorator to extract the current user from the request
 * 
 * @example
 * // Get entire user object
 * @CurrentUser() user: User
 * 
 * @example
 * // Get specific user property
 * @CurrentUser('id') userId: string
 * 
 * @example
 * // Get nested user property
 * @CurrentUser('organization.id') organizationId: string
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      return null;
    }

    if (!data) {
      return user;
    }

    // Handle nested properties using dot notation
    return data.split('.').reduce((obj: any, key: string) => {
      return obj?.[key];
    }, user);
  },
);

/**
 * Type-safe version of CurrentUser decorator
 * 
 * @example
 * @TypedCurrentUser<{id: string}>('id') userId: string
 */
export const TypedCurrentUser = <T = User>(propertyPath?: keyof T) =>
  CurrentUser(propertyPath as string);