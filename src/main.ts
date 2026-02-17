import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL') as string;

  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  });

  // Serve static files from uploads directory
  // Use process.cwd() to get project root, as __dirname points to dist/src
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Rule PDFs: files in pdf/rules/ served at /pdf/rules/ (Rule.downloadLink in DB is path/filename; frontend requests from API)
  app.useStaticAssets(join(process.cwd(), 'pdf'), {
    prefix: '/pdf/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableCircularCheck: true,
    }),
  );

  const port = configService.get<number>('PORT') as number;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
