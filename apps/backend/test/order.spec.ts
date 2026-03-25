import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "../src/app.module";

describe("POST /customer/orders", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("受注を登録して注文番号を返す", async () => {
    const response = await request(app.getHttpServer()).post("/customer/orders").send({
      productId: "rose-garden",
      productName: "ローズガーデン",
      deliveryDate: "2026-04-10",
      deliveryAddress: "東京都港区南青山 1-2-3",
      message: "開店祝いのお花です。",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      orderId: "ORD-0001",
      status: "confirmed",
    });
  });
});
