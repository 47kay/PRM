import { userSchemas } from './user.schema';
import { authSchemas } from './auth.schema';
// Import other schema files as needed

export function getAllSchemas() {
  return {
    ...userSchemas,
    ...authSchemas,
    // Add other schemas as needed
  };
}