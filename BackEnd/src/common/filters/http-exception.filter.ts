// src/common/filters/http-exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
    path: string;
    timestamp: string;
    method: string;
    correlationId?: string;
}

// Define a proper type for HttpException response object
interface HttpExceptionResponse {
    message: string | string[];
    error?: string;
    statusCode?: number;
    [key: string]: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let error = 'Internal Server Error';

        // Handle different types of exceptions
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const errorResponse = exception.getResponse() as HttpExceptionResponse;
            
            if (typeof errorResponse === 'object' && 'message' in errorResponse) {
                message = errorResponse.message;
                error = errorResponse.error || this.getErrorName(status);
            } else {
                message = exception.message;
                error = this.getErrorName(status);
            }
        } else if (exception instanceof QueryFailedError) {
            // Handle database errors
            status = HttpStatus.BAD_REQUEST;
            message = 'Database operation failed';
            error = 'Database Error';

            // Check for unique constraint violations
            if ((exception.message as string).includes('duplicate key')) {
                message = 'A record with this value already exists';
                error = 'Duplicate Entry';
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Create the error response
        const errorResponse: ErrorResponse = {
            statusCode: status,
            message,
            error,
            path: request.url,
            timestamp: new Date().toISOString(),
            method: request.method,
            correlationId: request.headers['x-correlation-id'] as string,
        };

        // Log the error
        this.logError(errorResponse, exception);

        // Send the response
        response
            .status(status)
            .json(errorResponse);
    }

    private getErrorName(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return 'Bad Request';
            case HttpStatus.UNAUTHORIZED:
                return 'Unauthorized';
            case HttpStatus.FORBIDDEN:
                return 'Forbidden';
            case HttpStatus.NOT_FOUND:
                return 'Not Found';
            case HttpStatus.CONFLICT:
                return 'Conflict';
            case HttpStatus.UNPROCESSABLE_ENTITY:
                return 'Unprocessable Entity';
            case HttpStatus.TOO_MANY_REQUESTS:
                return 'Too Many Requests';
            case HttpStatus.INTERNAL_SERVER_ERROR:
                return 'Internal Server Error';
            case HttpStatus.BAD_GATEWAY:
                return 'Bad Gateway';
            case HttpStatus.SERVICE_UNAVAILABLE:
                return 'Service Unavailable';
            default:
                return 'Error';
        }
    }

    private logError(errorResponse: ErrorResponse, exception: unknown) {
        const logMessage = {
            ...errorResponse,
            stack: exception instanceof Error ? exception.stack : undefined,
        };

        if (errorResponse.statusCode >= 500) {
            this.logger.error(JSON.stringify(logMessage));
        } else {
            this.logger.warn(JSON.stringify(logMessage));
        }

        // If you're using error monitoring service like Sentry
        // Sentry.captureException(exception, {
        //     extra: errorResponse,
        //     tags: {
        //         path: errorResponse.path,
        //         method: errorResponse.method,
        //     },
        // });
    }
}

// Example usage in main.ts:
/*
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // Apply the filter globally
    app.useGlobalFilters(new HttpExceptionFilter());
    
    await app.listen(3000);
}
*/

// Example custom exceptions:
/*
export class ValidationException extends HttpException {
    constructor(message: string | string[]) {
        super(
            {
                statusCode: HttpStatus.BAD_REQUEST,
                message,
                error: 'Validation Error',
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class NotFoundException extends HttpException {
    constructor(resource: string) {
        super(
            {
                statusCode: HttpStatus.NOT_FOUND,
                message: `${resource} not found`,
                error: 'Not Found',
            },
            HttpStatus.NOT_FOUND,
        );
    }
}
*/