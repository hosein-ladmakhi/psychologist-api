import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService = await app.get<ConfigService>(ConfigService);
  const port = await configService.get<number>('APP_PORT');

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.listen(port, () => {
    console.log(`The server is running at port ${port}`);
  });
};

bootstrap();
