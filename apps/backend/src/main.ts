import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const port = Number(process.env.PORT ?? 3000);

  app.enableCors({
    origin: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Fleur Memoire API")
    .setDescription("花束問題ケーススタディの API 仕様")
    .setVersion("1.2.0")
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup("docs", app, swaggerDocument, {
    jsonDocumentUrl: "docs-json",
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port, "0.0.0.0");
  Logger.log(`Backend listening on http://localhost:${port}`, "Bootstrap");
  Logger.log(`Swagger UI available at http://localhost:${port}/docs`, "Bootstrap");
}

bootstrap();
