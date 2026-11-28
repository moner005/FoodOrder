import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const production = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET?.trim() ?? '';
  if (production && (jwtSecret.length < 32 || jwtSecret === 'REPLACE_WITH_YOUR_OWN_LONG_RANDOM_SECRET')) {
    await app.close();
    throw new Error('Set a strong, unique JWT_SECRET before starting the production API.');
  }

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerEnabled = !production || process.env.ENABLE_SWAGGER === 'true';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('FoodOrder API')
      .setDescription('Multi-Restaurant Food Ordering Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, process.env.HOST ?? '127.0.0.1');
  console.log('FoodOrder API running on port ' + port);
  if (swaggerEnabled) console.log('Swagger: http://localhost:' + port + '/api/docs');
}

void bootstrap();
