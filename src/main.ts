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

  app.use(cookieParser())

  app.use(helmet());

  app.setGlobalPrefix('v1');

  app.enableVersioning({ type: VersioningType.URI }); 

  app.enableCors({ credentials: true, origin: AllowOrigins });

  SwaggerConfigInit(app);

  app.useGlobalPipes(new ValidationPipe())


  app.use(compression(CompressionConfig));

  const {PORT} = process.env;
  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
    console.log(`swagger: http://localhost:${PORT}/v1/api-docs`);
  });

}
bootstrap();
