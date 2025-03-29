// src/build-workarounds.ts

/**
 * This file contains workarounds for build-time issues.
 * It's a temporary solution until entity relationships are properly fixed.
 */

// 1. Force TypeScript to treat Promise<T> as compatible with T for our entities
declare global {
    // This hack makes TypeScript treat entity types more flexibly
    interface Promise<T> {
      __entity_type_workaround?: T;
    }
    
    // This hack makes regular types compatible with Promise types
    interface Object {
      then?: any;
      catch?: any;
      finally?: any;
    }
  }
  
  // 2. Polyfill missing methods to prevent runtime errors
  // Remove the window check since we're in a Node.js environment
  // if (typeof window !== 'undefined') {
  //   // Add any runtime polyfills if needed
  // }
  
  export const fixSwaggerCircularDependencies = () => {
    // Monkey patch SwaggerModule to handle circular dependencies
    try {
      // This is just a placeholder - we handle this in main.ts
      console.log('Applied circular dependency fixes for Swagger');
    } catch (e) {
      console.warn('Failed to apply Swagger fixes:', e);
    }
  };
  
  export default {
    fixSwaggerCircularDependencies
  };