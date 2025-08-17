import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// TODO: Add proper logging with Winston or similar
// TODO: Add security headers

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - TODO: Configure properly for production
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setVersion('1.0')
    .setTitle('Scheduler Microservice')
    .setDescription('A robust job scheduling microservice built with NestJS')
    .addTag('scheduler')
    .addTag('jobs')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Scheduler microservice is running on: http://localhost:${port}`);
  console.log(`API Documentation available at: http://localhost:${port}/api`);
}

bootstrap();
