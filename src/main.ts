import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ViewService } from './view/view.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the ViewService to use Next.js as a fallback handler
  const viewService = app.get(ViewService);

  // Use Next.js request handler as fallback for all non-API routes
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance().all('*', (req, res) => {
    return viewService.handler(req, res);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
}
bootstrap();
