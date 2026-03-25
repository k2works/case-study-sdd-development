import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  const port = Number(process.env.PORT ?? 3000);

  app.enableCors({
    origin: true,
  });

  await app.listen(port, "0.0.0.0");
  Logger.log(`Backend listening on http://localhost:${port}`, "Bootstrap");
}

bootstrap();
