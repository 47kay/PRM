// src/common/middleware/logger.middleware.ts

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as chalk from 'chalk';

interface RequestLog {
    correlationId: string;
    timestamp: string;
    method: string;
    url: string;
    userAgent: string;
    ip: string;
    userId?: string;
    organizationId?: string;
    requestBody?: any;
    responseTime?: number;
    statusCode?: number;
    error?: any;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(request: Request, response: Response, next: NextFunction): void {
        const { ip, method, originalUrl: url } = request;
        const userAgent = request.get('user-agent') || '';
        const correlationId = uuidv4();
        const startTime = Date.now();

        // Add correlation ID to request headers
        request.headers['x-correlation-id'] = correlationId;

        // Prepare log object
        const requestLog: RequestLog = {
            correlationId,
            timestamp: new Date().toISOString(),
            method,
            url,
            userAgent,
            ip: this.getClientIp(request),
            userId: (request.user as any)?.id,
            organizationId: (request.user as any)?.organizationId,
        };

        // Log request body for POST/PUT/PATCH methods
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            requestLog.requestBody = this.sanitizeRequestBody(request.body);
        }

        // Log when request starts
        this.logRequest(requestLog);

        // Handle response
        response.on('finish', () => {
            const { statusCode } = response;
            const contentLength = response.get('content-length');
            const responseTime = Date.now() - startTime;

            requestLog.statusCode = statusCode;
            requestLog.responseTime = responseTime;

            this.logResponse({
                ...requestLog,
                contentLength,
                statusCode,
                responseTime,
            });

            // Store metrics if needed
            this.storeMetrics(requestLog);
        });

        // Handle errors
        response.on('error', (error) => {
            requestLog.error = error;
            this.logError(requestLog);
        });

        next();
    }

    private getClientIp(request: Request): string {
        const forwardedFor = request.headers['x-forwarded-for'];
        if (forwardedFor) {
            return Array.isArray(forwardedFor) 
                ? forwardedFor[0] 
                : forwardedFor.split(',')[0];
        }
        return request.ip || ''; // Add fallback empty string in case ip is undefined
    }

    private sanitizeRequestBody(body: any): any {
        if (!body) return body;

        const sensitiveFields = ['password', 'token', 'secret', 'creditCard'];
        const sanitized = { ...body };

        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '***';
            }
        }

        return sanitized;
    }

    private logRequest(log: RequestLog): void {
        const message = chalk.blue(`Incoming Request`) + 
            chalk.gray(` [${log.correlationId}]`) +
            `\n  ${chalk.green(log.method)} ${log.url}` +
            `\n  User-Agent: ${log.userAgent}` +
            `\n  IP: ${log.ip}`;

        this.logger.log(message);

        if (log.requestBody) {
            this.logger.debug(`Request Body: ${JSON.stringify(log.requestBody)}`);
        }
    }

    private logResponse(log: RequestLog & { contentLength?: string }): void {
        const statusColor = this.getStatusColor(log.statusCode!);
        const message = chalk.blue(`Response Sent`) + 
            chalk.gray(` [${log.correlationId}]`) +
            `\n  ${log.method} ${log.url}` +
            `\n  Status: ${statusColor(log.statusCode)}` +
            `\n  Time: ${log.responseTime}ms` +
            (log.contentLength ? `\n  Size: ${log.contentLength}b` : '');

        if (log.statusCode! >= 400) {
            this.logger.warn(message);
        } else {
            this.logger.log(message);
        }
    }

    private logError(log: RequestLog): void {
        const message = chalk.red(`Error in Request`) + 
            chalk.gray(` [${log.correlationId}]`) +
            `\n  ${log.method} ${log.url}` +
            `\n  Error: ${log.error.message}`;

        this.logger.error(message, log.error.stack);
    }

    private getStatusColor(status: number): chalk.ChalkFunction {
        if (status >= 500) return chalk.red;
        if (status >= 400) return chalk.yellow;
        if (status >= 300) return chalk.cyan;
        if (status >= 200) return chalk.green;
        return chalk.gray;
    }

    private async storeMetrics(log: RequestLog): Promise<void> {
        try {
            // Example: Store metrics in Redis or other monitoring service
            // await this.metricsService.store({
            //     timestamp: log.timestamp,
            //     path: log.url,
            //     method: log.method,
            //     responseTime: log.responseTime,
            //     statusCode: log.statusCode,
            //     organizationId: log.organizationId,
            // });

            // Example: Monitor slow requests
            if (log.responseTime! > 1000) {
                this.logger.warn(
                    `Slow Request [${log.correlationId}]: ${log.method} ${log.url} took ${log.responseTime}ms`
                );
            }

            // Example: Monitor error rates
            if (log.statusCode! >= 500) {
                // Alert if error rate exceeds threshold
                // await this.alertingService.checkErrorRate(log.url);
            }
        } catch (error) {
            this.logger.error('Failed to store metrics', error);
        }
    }
}

// Usage in AppModule:
/*
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

@Module({})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes('*');
    }
}
*/