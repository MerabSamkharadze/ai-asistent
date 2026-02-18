import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Railway ავტომატურად ითხოვს პორტს PORT env variable-ით
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // '0.0.0.0' მნიშვნელოვანია!

  console.log(`🚀 Application is running on port ${port}`);
}
bootstrap();
