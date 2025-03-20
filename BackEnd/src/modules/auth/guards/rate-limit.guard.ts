// src/modules/auth/guards/rate-limit.guard.ts

import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

/**
 * In-memory store for rate limiting
 * In a production environment, you would use Redis or another distributed cache
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    lastRequest: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  // Static store to track request counts across instances
  private static store: RateLimitStore = {};
  
  // Rate limit configuration
  private readonly maxRequests = 100; // Maximum requests per window
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes window

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Generate a key based on IP address
    const ip = this.getIp(request);
    const key = `${ip}`;
    
    // Initialize or get the rate limit data for this key
    const now = Date.now();
    const data = RateLimitGuard.store[key] || { count: 0, lastRequest: now };
    
    // Reset count if outside window
    if (now - data.lastRequest > this.windowMs) {
      data.count = 0;
      data.lastRequest = now;
    }
    
    // Increment request count
    data.count += 1;
    
    // Update store
    RateLimitGuard.store[key] = data;
    
    // Set headers to inform client about rate limits
    const response = context.switchToHttp().getResponse();
    response.header('X-RateLimit-Limit', this.maxRequests);
    response.header('X-RateLimit-Remaining', Math.max(0, this.maxRequests - data.count));
    
    // Check if rate limit is exceeded
    if (data.count > this.maxRequests) {
      const resetTime = new Date(data.lastRequest + this.windowMs);
      response.header('X-RateLimit-Reset', resetTime.toISOString());
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    
    return true;
  }
  
  /**
   * Get IP address from request, handling proxies
   */
  private getIp(request: Request): string {
    // Try X-Forwarded-For header first (for proxied requests)
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor) 
        ? forwardedFor[0] 
        : forwardedFor.split(',')[0].trim();
    }
    
    // Fall back to standard IP
    return request.ip || 'unknown';
  }
}