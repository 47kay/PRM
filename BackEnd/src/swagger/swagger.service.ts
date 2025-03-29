import { Injectable, Logger } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule as NestSwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ManualOpenAPIObject } from './interfaces/manual-api.interface';
import { getAllSchemas } from './schemas';
import { getAllPaths } from './paths';

@Injectable()
export class SwaggerService {
  private readonly logger = new Logger(SwaggerService.name);

  setup(app: INestApplication): void {
    try {
      this.logger.log('Setting up manual Swagger documentation...');
      
      const config = new DocumentBuilder()
        .setTitle('Patient Relationship Manager API')
        .setDescription('API Documentation for PRM')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Users', 'User management endpoints')
        .addTag('Organizations', 'Organization management endpoints')
        .addTag('Contacts', 'Contact management endpoints')
        .addTag('Appointments', 'Appointment scheduling endpoints')
        .addTag('Tickets', 'Support ticket endpoints')
        .addTag('Messages', 'Messaging functionality endpoints')
        .addTag('Notifications', 'Notification management endpoints')
        .build();

      // Create a manual document
      const document: ManualOpenAPIObject = {
        ...config,
        paths: getAllPaths(),
        components: {
          schemas: getAllSchemas(),
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        }
      };
      
      NestSwaggerModule.setup('api-docs', app, document as any);
      this.logger.log('Manual Swagger documentation setup at /api-docs path');
    } catch (error) {
      this.logger.error(`Failed to set up Swagger: ${error.message}`);
      this.logger.error(error.stack);
    }
  }
}