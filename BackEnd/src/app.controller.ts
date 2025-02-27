// src/app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOperation({ summary: 'Get application info' })
    @ApiResponse({ status: 200, description: 'Application info retrieved successfully' })
    getInfo() {
        return {
            name: 'Patient Relationship Manager',
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('health')
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'System is healthy' })
    async healthCheck() {
        const health = await this.appService.checkHealth();
        return {
            status: health.isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            services: health.services,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
    }

    @Get('ping')
    @ApiOperation({ summary: 'Simple ping endpoint' })
    @ApiResponse({ status: 200, description: 'Pong' })
    ping() {
        return { message: 'pong', timestamp: new Date().toISOString() };
    }
}