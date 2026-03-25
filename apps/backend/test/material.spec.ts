import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "../src/app.module";

describe("GET /admin/materials", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("花材一覧を仕入条件つきで返す", async () => {
    const response = await request(app.getHttpServer()).get("/admin/materials");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        materialId: "MAT-001",
        materialName: "バラ赤",
        shelfLifeDays: 5,
        purchaseUnit: 10,
        leadTimeDays: 2,
        supplierName: "東京フラワー商事",
      },
      {
        materialId: "MAT-002",
        materialName: "カスミソウ",
        shelfLifeDays: 4,
        purchaseUnit: 6,
        leadTimeDays: 1,
        supplierName: "関東グリーンサプライ",
      },
    ]);
  });

  it("花材を更新すると在庫推移に反映される", async () => {
    const saveResponse = await request(app.getHttpServer()).post("/admin/materials").send({
      materialId: "MAT-001",
      materialName: "バラ赤 特選",
      shelfLifeDays: 6,
      purchaseUnit: 12,
      leadTimeDays: 3,
      supplierName: "東京フラワー商事",
    });

    expect(saveResponse.status).toBe(201);

    const inventoryResponse = await request(app.getHttpServer())
      .get("/admin/inventory-projections")
      .query({ startDate: "2026-04-10", endDate: "2026-04-12" });

    expect(inventoryResponse.status).toBe(200);
    expect(inventoryResponse.body.items[0]).toEqual({
      materialId: "MAT-001",
      materialName: "バラ赤 特選",
      projections: [
        { date: "2026-04-10", projectedQuantity: 12 },
        { date: "2026-04-11", projectedQuantity: -2 },
        { date: "2026-04-12", projectedQuantity: 24 },
      ],
    });

    const purchaseCandidateResponse = await request(app.getHttpServer())
      .get("/admin/purchase-orders/candidates")
      .query({ startDate: "2026-04-10", endDate: "2026-04-12" });

    expect(purchaseCandidateResponse.status).toBe(200);
    expect(purchaseCandidateResponse.body).toEqual([
      {
        supplierName: "東京フラワー商事",
        items: [
          {
            materialId: "MAT-001",
            materialName: "バラ赤 特選",
            shortageDate: "2026-04-11",
            shortageQuantity: 2,
            suggestedQuantity: 12,
            purchaseUnit: 12,
          },
        ],
      },
    ]);
  });
});
