import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "../src/app.module";

describe("GET /admin/purchase-orders/candidates", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("不足見込みから仕入先別の発注候補を返す", async () => {
    const response = await request(app.getHttpServer())
      .get("/admin/purchase-orders/candidates")
      .query({ startDate: "2026-04-10", endDate: "2026-04-12" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        supplierName: "東京フラワー商事",
        items: [
          {
            materialId: "MAT-001",
            materialName: "バラ赤",
            shortageDate: "2026-04-11",
            shortageQuantity: 2,
            suggestedQuantity: 10,
            purchaseUnit: 10,
          },
        ],
      },
    ]);
  });

  it("不足量が購入単位を超える場合は切り上げた推奨数量を返す", async () => {
    await request(app.getHttpServer()).post("/admin/materials").send({
      materialId: "MAT-001",
      materialName: "バラ赤",
      shelfLifeDays: 5,
      purchaseUnit: 1,
      leadTimeDays: 2,
      supplierName: "東京フラワー商事",
    });

    const response = await request(app.getHttpServer())
      .get("/admin/purchase-orders/candidates")
      .query({ startDate: "2026-04-10", endDate: "2026-04-12" });

    expect(response.status).toBe(200);
    expect(response.body[0].items[0]).toEqual({
      materialId: "MAT-001",
      materialName: "バラ赤",
      shortageDate: "2026-04-11",
      shortageQuantity: 2,
      suggestedQuantity: 2,
      purchaseUnit: 1,
    });
  });
});

describe("POST /admin/purchase-orders", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("発注を確定すると送信待ちで保存される", async () => {
    const response = await request(app.getHttpServer()).post("/admin/purchase-orders").send({
      supplierName: "東京フラワー商事",
      items: [
        {
          materialId: "MAT-001",
          quantity: 10,
        },
      ],
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      purchaseOrderId: "PO-0001",
      status: "送信待ち",
    });
  });

  it("数量 0 以下は確定できない", async () => {
    const response = await request(app.getHttpServer()).post("/admin/purchase-orders").send({
      supplierName: "東京フラワー商事",
      items: [
        {
          materialId: "MAT-001",
          quantity: 0,
        },
      ],
    });

    expect(response.status).toBe(400);
  });

  it("同一内容の重複確定には再送案内を返す", async () => {
    await request(app.getHttpServer()).post("/admin/purchase-orders").send({
      supplierName: "東京フラワー商事",
      items: [
        {
          materialId: "MAT-001",
          quantity: 10,
        },
      ],
    });

    const response = await request(app.getHttpServer()).post("/admin/purchase-orders").send({
      supplierName: "東京フラワー商事",
      items: [
        {
          materialId: "MAT-001",
          quantity: 10,
        },
      ],
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain("再送案内");
  });
});
