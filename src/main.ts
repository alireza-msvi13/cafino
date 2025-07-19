import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as compression from 'compression'
import { AllowOrigins } from './common/constants/allow-origins.constant';
import { CompressionConfig } from './common/constants/compression.constant';
import { SwaggerConfigInit } from './common/config/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', true);

  app.use(cookieParser());

  app.use(helmet());

  app.setGlobalPrefix('v1');

  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors({ credentials: true, origin: true });

  SwaggerConfigInit(app);

  app.useGlobalPipes(new ValidationPipe())

  app.use(compression(CompressionConfig));

  await app.listen(process.env.PORT);

}
bootstrap();
