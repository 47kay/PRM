// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
// Comment out problematic imports
// import helmet from 'helmet';
// import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware - temporarily commented out
  // app.use(helmet());
  // app.use(compression());

  app.enableCors({
    origin: configService.get('app.corsOrigins'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger documentation
  const config = new DocumentBuilder()
      .setTitle('Patient Relationship Manager API')
      .setDescription('API documentation for Patient Relationship Manager')
      .setVersion(configService.get('app.version') || '1.0.0')
      .addBearerAuth()
      .addTag('System')
      .addTag('Auth')
      .addTag('Users')
      .addTag('Organizations')
      .addTag('Contacts')
      .addTag('Appointments')
      .addTag('Tickets')
      .addTag('Messages')
      .addTag('Notifications')
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Start server
  const port = configService.get('app.port');
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`API documentation available at: ${await app.getUrl()}/api`);
}

bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});