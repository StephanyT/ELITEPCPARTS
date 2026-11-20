import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { isProduction } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Headers de seguridad básicos (evitan que la API se cargue en iframes, etc.)
  app.use(helmet());

  // Solo el frontend propio puede llamar a la API desde el navegador.
  // CORS_ORIGINS acepta varios dominios separados por coma.
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost,http://localhost:80,http://127.0.0.1')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // borra los campos que no están en el DTO
      forbidNonWhitelisted: true, // y si mandan campos de más, responde 400
      transform: true,
    }),
  );

  // La documentación de la API solo se publica fuera de producción
  if (!isProduction()) {
    const config = new DocumentBuilder()
      .setTitle('Elite PC Parts API')
      .setDescription('API del backend de Elite PC Parts')
      .setVersion('1.1')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));
  }

  await app.listen(3000);
}
bootstrap();
