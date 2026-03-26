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

describe("POST /admin/orders/:orderId/delivery-date-change", () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("条件を満たす場合は届け日を更新できる", async () => {
    const response = await request(app.getHttpServer())
      .post("/admin/orders/ORD-1001/delivery-date-change")
      .send({ deliveryDate: "2026-04-13" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      orderId: "ORD-1001",
      deliveryDate: "2026-04-13",
      shippingDate: "2026-04-12",
      status: "confirmed",
    });

    const detailResponse = await request(app.getHttpServer()).get("/admin/orders/ORD-1001");

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.deliveryDate).toBe("2026-04-13");
    expect(detailResponse.body.shippingDate).toBe("2026-04-12");
  });

  it("新しい出荷日に在庫不足がある場合は変更できない", async () => {
    const response = await request(app.getHttpServer())
      .post("/admin/orders/ORD-1001/delivery-date-change")
      .send({ deliveryDate: "2026-04-12" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("在庫不足のため届け日を変更できません。");
  });

  it("空の届け日は入力エラーとして拒否する", async () => {
    const response = await request(app.getHttpServer())
      .post("/admin/orders/ORD-1001/delivery-date-change")
      .send({ deliveryDate: "" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("届け日は YYYY-MM-DD 形式で入力してください。");
  });

  it("出荷準備済みの受注は届け日を変更できない", async () => {
    await request(app.getHttpServer())
      .post("/admin/purchase-orders/PO-9001/receipts")
      .send({
        receiptDate: "2026-04-11",
        items: [{ materialId: "MAT-001", quantity: 10 }],
      });
    await request(app.getHttpServer()).post("/admin/orders/ORD-1002/bundle-completions").send({});

    const response = await request(app.getHttpServer())
      .post("/admin/orders/ORD-1002/delivery-date-change")
      .send({ deliveryDate: "2026-04-13" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("出荷準備済みのため届け日を変更できません。");
  });
});
