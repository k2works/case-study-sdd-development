import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "../src/app.module";

describe("GET /customer/products", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("注文画面向けに販売中の商品一覧を返す", async () => {
    const response = await request(app.getHttpServer()).get("/customer/products");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        productId: "rose-garden",
        productName: "ローズガーデン",
        description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
        price: 5500,
      },
      {
        productId: "seasonal-mimosa",
        productName: "季節のミモザブーケ",
        description: "旬のミモザを主役にした、春の贈り物向けの花束です。",
        price: 4800,
      },
      {
        productId: "white-lily",
        productName: "ホワイトリリー",
        description: "白を基調にまとめた、上品で落ち着いたアレンジです。",
        price: 6200,
      },
    ]);
  });
});

describe("GET /admin/products", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("商品一覧を花束構成つきで返す", async () => {
    const response = await request(app.getHttpServer()).get("/admin/products");

    expect(response.status).toBe(200);
    expect(response.body[0]).toEqual({
      productId: "rose-garden",
      productName: "ローズガーデン",
      description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
      price: 5500,
      isActive: true,
      materials: [
        { materialId: "MAT-001", quantity: 10 },
        { materialId: "MAT-002", quantity: 2 },
      ],
    });
  });

  it("商品を更新すると注文画面の商品一覧へ反映される", async () => {
    const saveResponse = await request(app.getHttpServer()).post("/admin/products").send({
      productId: "rose-garden",
      productName: "ローズガーデン プレミアム",
      description: "赤バラを増量した上位版ブーケです。",
      price: 6800,
      isActive: true,
      materials: [
        { materialId: "MAT-001", quantity: 12 },
        { materialId: "MAT-002", quantity: 3 },
      ],
    });

    expect(saveResponse.status).toBe(201);

    const customerProductsResponse = await request(app.getHttpServer()).get("/customer/products");

    expect(customerProductsResponse.status).toBe(200);
    expect(customerProductsResponse.body[0]).toEqual({
      productId: "rose-garden",
      productName: "ローズガーデン プレミアム",
      description: "赤バラを増量した上位版ブーケです。",
      price: 6800,
    });
  });
});
