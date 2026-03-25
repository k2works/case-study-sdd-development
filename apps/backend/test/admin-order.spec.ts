import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "../src/app.module";

describe("GET /admin/orders", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("受注一覧を主要項目つきで返す", async () => {
    const response = await request(app.getHttpServer()).get("/admin/orders");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        orderId: "ORD-1001",
        customerName: "青山フラワー",
        productName: "ローズガーデン",
        deliveryDate: "2026-04-10",
        shippingDate: "2026-04-09",
        status: "confirmed",
      },
      {
        orderId: "ORD-1002",
        customerName: "表参道ギャラリー",
        productName: "ホワイトリリー",
        deliveryDate: "2026-04-12",
        shippingDate: "2026-04-11",
        status: "shipping-prep",
      },
    ]);
  });

  it("顧客名で絞り込める", async () => {
    const response = await request(app.getHttpServer())
      .get("/admin/orders")
      .query({ customerName: "青山" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        orderId: "ORD-1001",
        customerName: "青山フラワー",
        productName: "ローズガーデン",
        deliveryDate: "2026-04-10",
        shippingDate: "2026-04-09",
        status: "confirmed",
      },
    ]);
  });
});

describe("GET /admin/orders/:orderId", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("選択した受注の詳細を返す", async () => {
    const response = await request(app.getHttpServer()).get("/admin/orders/ORD-1001");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      orderId: "ORD-1001",
      customerName: "青山フラワー",
      productName: "ローズガーデン",
      deliveryDate: "2026-04-10",
      shippingDate: "2026-04-09",
      status: "confirmed",
      deliveryAddress: "東京都港区南青山 1-2-3",
      message: "開店祝いのお花です。",
    });
  });

  it("新規受注は届け日の前日を出荷日として詳細表示できる", async () => {
    const createResponse = await request(app.getHttpServer()).post("/customer/orders").send({
      productId: "rose-garden",
      productName: "ローズガーデン",
      deliveryDate: "2026-04-15",
      deliveryAddress: "東京都港区南青山 1-2-3",
      message: "開店祝いのお花です。",
    });

    const response = await request(app.getHttpServer()).get(
      `/admin/orders/${createResponse.body.orderId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.shippingDate).toBe("2026-04-14");
  });
});
