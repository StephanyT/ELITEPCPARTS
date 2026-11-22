import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { isProduction } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Headers de seguridad básicos (evitan que la API se cargue en iframes, ocultan "x-powered-by", etc.)
  app.use(helmet());

  // Solo el frontend propio puede llamar a la API desde el navegador.
  // CORS_ORIGINS acepta varios dominios separados por coma.
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost,http://127.0.0.1')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // borra los campos que no están en el DTO
      forbidNonWhitelisted: true, // y si mandan campos de más, responde 400
      transform: true, // convierte el body en una instancia del DTO
    }),
  );

  // La documentación de la API solo se publica fuera de producción
  if (!isProduction()) {
    const config = new DocumentBuilder()
      .setTitle('Socket Society API')
      .setDescription('API del backend de Socket Society')
      .setVersion('1.1')
      .addBearerAuth()
      .addSecurityRequirements('bearer')
      .build();
    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config), {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(3000);
}
bootstrap();