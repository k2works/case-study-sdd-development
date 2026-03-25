import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "../src/app.module";

describe("GET /admin/inventory-projections", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("指定期間の日別在庫予定数を返す", async () => {
    const response = await request(app.getHttpServer())
      .get("/admin/inventory-projections")
      .query({ startDate: "2026-04-10", endDate: "2026-04-12" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      startDate: "2026-04-10",
      endDate: "2026-04-12",
      dates: ["2026-04-10", "2026-04-11", "2026-04-12"],
      items: [
        {
          materialName: "バラ赤",
          projections: [
            { date: "2026-04-10", projectedQuantity: 12 },
            { date: "2026-04-11", projectedQuantity: -2 },
            { date: "2026-04-12", projectedQuantity: 24 },
          ],
        },
        {
          materialName: "カスミソウ",
          projections: [
            { date: "2026-04-10", projectedQuantity: 6 },
            { date: "2026-04-11", projectedQuantity: 5 },
            { date: "2026-04-12", projectedQuantity: 22 },
          ],
        },
      ],
    });
  });

  it("開始日が終了日より後なら 400 を返す", async () => {
    const response = await request(app.getHttpServer())
      .get("/admin/inventory-projections")
      .query({ startDate: "2026-04-12", endDate: "2026-04-10" });

    expect(response.status).toBe(400);
  });

  it("対応範囲外の期間なら 400 を返す", async () => {
    const response = await request(app.getHttpServer())
      .get("/admin/inventory-projections")
      .query({ startDate: "2026-04-01", endDate: "2026-04-03" });

    expect(response.status).toBe(400);
  });
});
