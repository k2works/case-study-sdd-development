import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createPurchaseOrderRoutes } from './purchase-order-routes.js';
import { PurchaseOrderUseCase } from '../../application/purchase-order/purchase-order-usecase.js';
import { InMemoryPurchaseOrderRepository } from '../../application/purchase-order/in-memory-purchase-order-repository.js';
import { InMemoryItemRepository } from '../../application/item/in-memory-item-repository.js';
import { Item } from '../../domain/item/item.js';
import { ItemId, ItemName, Days, PurchaseUnit, SupplierId } from '../../domain/shared/value-objects.js';

describe('Purchase Order API', () => {
  let app: express.Express;

  beforeEach(async () => {
    const purchaseOrderRepo = new InMemoryPurchaseOrderRepository();
    const itemRepo = new InMemoryItemRepository();
    const useCase = new PurchaseOrderUseCase(purchaseOrderRepo, itemRepo);

    app = express();
    app.use(express.json());
    app.use('/api', createPurchaseOrderRoutes(useCase));

    await itemRepo.save(new Item({
      itemId: new ItemId(1),
      name: new ItemName('赤バラ'),
      qualityRetentionDays: new Days(5),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: new Days(2),
      supplierId: new SupplierId(1),
    }));
  });

  it('POST /api/purchase-orders で発注を作成できる', async () => {
    const res = await request(app)
      .post('/api/purchase-orders')
      .send({ itemId: 1, quantity: 25 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 1,
      itemId: 1,
      quantity: 30, // 購入単位調整
      status: '発注済み',
    });
  });

  it('存在しない単品の場合は 400 エラー', async () => {
    const res = await request(app)
      .post('/api/purchase-orders')
      .send({ itemId: 999, quantity: 10 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('単品が見つかりません');
  });
});
