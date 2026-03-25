import "reflect-metadata";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "../src/app.module";

describe("GET /admin/shipping-targets", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("出荷日の対象受注と必要花材を返す", async () => {
    const response = await request(app.getHttpServer())
      .get("/admin/shipping-targets")
      .query({ shippingDate: "2026-04-11" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        orderId: "ORD-1002",
        customerName: "表参道ギャラリー",
        productName: "ホワイトリリー",
        shippingDate: "2026-04-11",
        status: "shipping-prep",
        materials: [
          {
            materialId: "MAT-001",
            materialName: "バラ赤",
            requiredQuantity: 8,
            projectedQuantity: -2,
          },
          {
            materialId: "MAT-002",
            materialName: "カスミソウ",
            requiredQuantity: 4,
            projectedQuantity: 5,
          },
        ],
        hasShortage: true,
      },
    ]);
  });
});

describe("POST /admin/orders/:orderId/bundle-completions", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeEach(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("在庫が足りれば結束完了を登録できる", async () => {
    await request(app.getHttpServer()).post("/admin/purchase-orders/PO-9001/receipts").send({
      receiptDate: "2026-04-11",
      items: [{ materialId: "MAT-001", quantity: 10 }],
    });

    const response = await request(app.getHttpServer())
      .post("/admin/orders/ORD-1002/bundle-completions")
      .send({});

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      orderId: "ORD-1002",
      status: "shipping-ready",
    });
  });

  it("在庫不足の対象は結束完了登録できない", async () => {
    const response = await request(app.getHttpServer())
      .post("/admin/orders/ORD-1002/bundle-completions")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("在庫不足");
  });
});
