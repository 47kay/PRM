import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class RateLimitGuard implements CanActivate {
    private static store;
    private readonly maxRequests;
    private readonly windowMs;
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    private getIp;
}
