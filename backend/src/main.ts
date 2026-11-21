import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));

  const config = new DocumentBuilder()
    .setTitle('Elite PC Parts API')
    .setDescription('API del backend de Elite PC Parts')
    .setVersion('1.0')
    .addBearerAuth()
    // Que Swagger mande el token en todas las rutas (las públicas lo ignoran)
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // persistAuthorization: el token no se borra al recargar la página
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(3000);
}
bootstrap();