import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 Habilitamos CORS para que React pueda enviar las ventas sin bloqueos
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
