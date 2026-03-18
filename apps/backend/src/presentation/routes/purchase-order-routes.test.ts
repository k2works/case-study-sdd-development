import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createPurchaseOrderRoutes } from './purchase-order-routes.js';
import { PurchaseOrderUseCase } from '../../application/purchase-order/purchase-order-usecase.js';
import { InMemoryItemRepository } from '../../application/item/in-memory-item-repository.js';
import { InMemoryPurchaseOrderRepository } from '../../application/purchase-order/in-memory-purchase-order-repository.js';
import { Item } from '../../domain/item/item.js';
import { Days, ItemId, ItemName, PurchaseUnit, SupplierId } from '../../domain/shared/value-objects.js';

describe('PurchaseOrder API', () => {
  let app: express.Express;
  let itemRepository: InMemoryItemRepository;

  beforeEach(() => {
    itemRepository = new InMemoryItemRepository();
    const purchaseOrderRepository = new InMemoryPurchaseOrderRepository();
    const useCase = new PurchaseOrderUseCase(purchaseOrderRepository, itemRepository);
    app = express();
    app.use(express.json());
    app.use('/api', createPurchaseOrderRoutes(useCase));
  });

  describe('POST /api/purchase-orders', () => {
    it('発注を作成できる', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-18T00:00:00.000Z'));
      await itemRepository.save(createItem());

      const res = await request(app).post('/api/purchase-orders').send({
        itemId: 1,
        quantity: 250,
      });

      expect(res.status).toBe(201);
      expect(res.body.purchaseOrderId).toBe(1);
      expect(res.body.itemId).toBe(1);
      expect(res.body.supplierId).toBe(1);
      expect(res.body.quantity).toBe(300);
      expect(res.body.status).toBe('発注済み');
      expect(res.body.orderDate).toBe('2026-03-18T00:00:00.000Z');
      expect(res.body.expectedArrivalDate).toBe('2026-03-21T00:00:00.000Z');
      vi.useRealTimers();
    });

    it('itemId が未指定の場合 400 エラーを返す', async () => {
      const res = await request(app).post('/api/purchase-orders').send({
        quantity: 250,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('quantity が未指定の場合 400 エラーを返す', async () => {
      const res = await request(app).post('/api/purchase-orders').send({
        itemId: 1,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('存在しない itemId の場合 404 エラーを返す', async () => {
      const res = await request(app).post('/api/purchase-orders').send({
        itemId: 999,
        quantity: 100,
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('単品が見つかりません');
    });
  });
});

const createItem = (): Item =>
  new Item({
    itemId: new ItemId(1),
    name: new ItemName('赤バラ'),
    qualityRetentionDays: new Days(5),
    purchaseUnit: new PurchaseUnit(100),
    leadTimeDays: new Days(3),
    supplierId: new SupplierId(1),
  });
