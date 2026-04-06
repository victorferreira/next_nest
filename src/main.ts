import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ViewService } from './view/view.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Initialize NestJS first so all API routes are registered
  await app.init();

  // Get the ViewService to use Next.js as a fallback handler
  const viewService = app.get(ViewService);

  // Register Next.js catch-all AFTER NestJS routes are initialized
  // so API routes are not intercepted
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance().all('*', (req, res) => {
    return viewService.handler(req, res);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
}
bootstrap();
