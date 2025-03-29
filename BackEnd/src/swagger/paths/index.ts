import { authPaths } from './auth.path';
import { userPaths } from './user.path';
// Import other path files as needed

export function getAllPaths() {
  return {
    ...authPaths,
    ...userPaths,
    // Add other paths as needed
  };
}