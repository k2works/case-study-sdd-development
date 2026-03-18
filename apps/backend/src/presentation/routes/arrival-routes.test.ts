import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createArrivalRoutes } from './arrival-routes.js';
import { ArrivalUseCase } from '../../application/arrival/arrival-usecase.js';
import { InMemoryArrivalRepository } from '../../application/arrival/in-memory-arrival-repository.js';
import { InMemoryPurchaseOrderRepository } from '../../application/purchase-order/in-memory-purchase-order-repository.js';
import { InMemoryStockLotRepository } from '../../application/stock/in-memory-stock-lot-repository.js';
import { InMemoryItemRepository } from '../../application/item/in-memory-item-repository.js';
import { Item } from '../../domain/item/item.js';
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import {
  Days,
  ItemId,
  ItemName,
  PurchaseOrderId,
  PurchaseOrderStatus,
  PurchaseUnit,
  Quantity,
  SupplierId,
} from '../../domain/shared/value-objects.js';

describe('arrival-routes', () => {
  let app: express.Express;
  let arrivalRepository: InMemoryArrivalRepository;
  let purchaseOrderRepository: InMemoryPurchaseOrderRepository;
  let stockLotRepository: InMemoryStockLotRepository;
  let itemRepository: InMemoryItemRepository;

  beforeEach(async () => {
    arrivalRepository = new InMemoryArrivalRepository();
    purchaseOrderRepository = new InMemoryPurchaseOrderRepository();
    stockLotRepository = new InMemoryStockLotRepository();
    itemRepository = new InMemoryItemRepository();

    const arrivalUseCase = new ArrivalUseCase(
      arrivalRepository,
      purchaseOrderRepository,
      stockLotRepository,
      itemRepository,
    );

    app = express();
    app.use(express.json());
    app.use('/api', createArrivalRoutes(arrivalUseCase, purchaseOrderRepository));

    // テストデータ
    await itemRepository.save(
      new Item({
        itemId: new ItemId(1),
        name: new ItemName('赤バラ'),
        qualityRetentionDays: new Days(7),
        purchaseUnit: new PurchaseUnit(100),
        leadTimeDays: new Days(3),
        supplierId: new SupplierId(10),
      }),
    );

    await purchaseOrderRepository.save(
      new PurchaseOrder({
        purchaseOrderId: new PurchaseOrderId(1),
        itemId: new ItemId(1),
        supplierId: new SupplierId(10),
        quantity: new Quantity(100),
        orderDate: new Date('2026-03-15'),
        expectedArrivalDate: new Date('2026-03-18'),
        status: new PurchaseOrderStatus('発注済み'),
      }),
    );
  });

  describe('POST /api/arrivals', () => {
    it('正常に入荷登録できる', async () => {
      const res = await request(app)
        .post('/api/arrivals')
        .send({ purchaseOrderId: 1, quantity: 100, arrivalDate: '2026-03-18' });

      expect(res.status).toBe(201);
      expect(res.body.arrivalId).toBeDefined();
      expect(res.body.quantity).toBe(100);
      expect(res.body.status).toBe('入荷済み');
    });

    it('purchaseOrderId が不正な場合 400', async () => {
      const res = await request(app)
        .post('/api/arrivals')
        .send({ purchaseOrderId: 0, quantity: 100, arrivalDate: '2026-03-18' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('purchaseOrderId');
    });

    it('quantity が不正な場合 400', async () => {
      const res = await request(app)
        .post('/api/arrivals')
        .send({ purchaseOrderId: 1, quantity: -1, arrivalDate: '2026-03-18' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('quantity');
    });

    it('arrivalDate が未指定の場合 400', async () => {
      const res = await request(app)
        .post('/api/arrivals')
        .send({ purchaseOrderId: 1, quantity: 100 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('arrivalDate');
    });

    it('存在しない発注の場合 404', async () => {
      const res = await request(app)
        .post('/api/arrivals')
        .send({ purchaseOrderId: 999, quantity: 100, arrivalDate: '2026-03-18' });

      expect(res.status).toBe(404);
    });

    it('入荷済みの発注への二重入荷は 400', async () => {
      // 1回目の入荷
      await request(app)
        .post('/api/arrivals')
        .send({ purchaseOrderId: 1, quantity: 100, arrivalDate: '2026-03-18' });

      // 2回目の入荷
      const res = await request(app)
        .post('/api/arrivals')
        .send({ purchaseOrderId: 1, quantity: 100, arrivalDate: '2026-03-18' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('既に入荷済みです');
    });

    it('数量不一致は 400', async () => {
      const res = await request(app)
        .post('/api/arrivals')
        .send({ purchaseOrderId: 1, quantity: 50, arrivalDate: '2026-03-18' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('入荷数量は発注数量と一致する必要があります');
    });
  });

  describe('GET /api/purchase-orders?status=発注済み', () => {
    it('発注済みの発注一覧を取得できる', async () => {
      const res = await request(app).get('/api/purchase-orders?status=発注済み');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe('発注済み');
    });

    it('入荷済みでフィルタできる', async () => {
      // 入荷を実行
      await request(app)
        .post('/api/arrivals')
        .send({ purchaseOrderId: 1, quantity: 100, arrivalDate: '2026-03-18' });

      const res = await request(app).get('/api/purchase-orders?status=入荷済み');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe('入荷済み');
    });
  });
});
