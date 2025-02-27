// src/common/interceptors/transform.interceptor.ts

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { classToPlain } from 'class-transformer';

export interface Response<T> {
    statusCode: number;
    message: string;
    data: T;
    metadata?: {
        timestamp: string;
        path: string;
        version: string;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse();
        const status = response.statusCode || HttpStatus.OK;

        return next.handle().pipe(
            map(data => {
                // Handle null or undefined data
                if (data === null || data === undefined) {
                    return this.buildResponse(null, status, request);
                }

                // Transform class instances to plain objects
                const transformedData = this.transformData(data);

                // Handle paginated responses
                if (this.isPaginatedResponse(transformedData)) {
                    return this.buildPaginatedResponse(transformedData, status, request);
                }

                // Handle regular responses
                return this.buildResponse(transformedData, status, request);
            }),
        );
    }

    private buildResponse(
        data: any,
        status: number,
        request: Request,
        paginationMeta?: any
    ): Response<T> {
        return {
            statusCode: status,
            message: this.getStatusMessage(status),
            data,
            metadata: {
                timestamp: new Date().toISOString(),
                path: request.url,
                version: process.env.API_VERSION || '1.0',
                ...(paginationMeta && { pagination: paginationMeta }),
            },
        };
    }

    private buildPaginatedResponse(
        data: PaginatedResponse<T>,
        status: number,
        request: Request
    ): Response<T> {
        const { items, ...paginationMeta } = data;
        return this.buildResponse(items, status, request, paginationMeta);
    }

    private transformData(data: any): any {
        // Transform class instances to plain objects
        if (data && typeof data === 'object') {
            return classToPlain(data, {
                excludePrefixes: ['_'],
                enableCircularCheck: true,
            });
        }
        return data;
    }

    private isPaginatedResponse(data: any): data is PaginatedResponse<T> {
        return (
            data &&
            Array.isArray(data.items) &&
            typeof data.page === 'number' &&
            typeof data.limit === 'number' &&
            typeof data.total === 'number' &&
            typeof data.totalPages === 'number'
        );
    }

    private getStatusMessage(status: number): string {
        switch (status) {
            case HttpStatus.OK:
                return 'Success';
            case HttpStatus.CREATED:
                return 'Created successfully';
            case HttpStatus.ACCEPTED:
                return 'Request accepted';
            case HttpStatus.NO_CONTENT:
                return 'No content';
            case HttpStatus.PARTIAL_CONTENT:
                return 'Partial content';
            default:
                return 'Operation completed';
        }
    }
}

// Example custom transformers:
/*
export class ExcludeNullTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => this.excludeNull(data)),
        );
    }

    private excludeNull(value: any): any {
        if (Array.isArray(value)) {
            return value.map(item => this.excludeNull(item));
        }
        if (value !== null && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value)
                    .filter(([_, v]) => v !== null)
                    .map(([k, v]) => [k, this.excludeNull(v)])
            );
        }
        return value;
    }
}

export class DateTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => this.transformDates(data)),
        );
    }

    private transformDates(value: any): any {
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (Array.isArray(value)) {
            return value.map(item => this.transformDates(item));
        }
        if (value !== null && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value).map(([k, v]) => [k, this.transformDates(v)])
            );
        }
        return value;
    }
}
*/

// Example usage in a controller:
/*
@Controller('api/users')
@UseInterceptors(TransformInterceptor)
export class UsersController {
    @Get()
    async findAll(): Promise<PaginatedResponse<User>> {
        const users = await this.usersService.findAll();
        return {
            items: users,
            page: 1,
            limit: 10,
            total: 100,
            totalPages: 10
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User> {
        return this.usersService.findOne(id);
    }
}
*/