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
      customerEmail: "hanako@example.com",
      customerPhone: "090-1111-2222",
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

describe("GET /customer/delivery-addresses", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("メールアドレスと電話番号が一致する過去の届け先一覧を返す", async () => {
    const response = await request(app.getHttpServer())
      .get("/customer/delivery-addresses")
      .query({
        customerEmail: "hanako@example.com",
        customerPhone: "090-1111-2222",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        deliveryAddressId: "ADDR-1002",
        recipientName: "佐藤 一郎",
        postalCode: "150-0001",
        deliveryAddress: "東京都渋谷区神宮前 4-5-6",
        deliveryPhoneNumber: "03-1111-2222",
        lastUsedAt: "2026-04-12",
      },
      {
        deliveryAddressId: "ADDR-1001",
        recipientName: "山田 花子",
        postalCode: "107-0062",
        deliveryAddress: "東京都港区南青山 1-2-3",
        deliveryPhoneNumber: "03-1234-5678",
        lastUsedAt: "2026-04-10",
      },
    ]);
  });

  it("一致する履歴がない場合は空配列を返す", async () => {
    const response = await request(app.getHttpServer())
      .get("/customer/delivery-addresses")
      .query({
        customerEmail: "unknown@example.com",
        customerPhone: "090-9999-9999",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("メールアドレスと電話番号の表記揺れを正規化して照合できる", async () => {
    const response = await request(app.getHttpServer())
      .get("/customer/delivery-addresses")
      .query({
        customerEmail: " Hanako@Example.com ",
        customerPhone: "09011112222",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});
