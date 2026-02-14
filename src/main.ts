import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // შენი Angular-ის მისამართი
    methods: 'GET,POST',
  });

  await app.listen(3000);
  console.log('🚀 Server is running on: http://localhost:3000');
}
bootstrap();
