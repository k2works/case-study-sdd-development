import { describe, expect, it } from 'vitest';
import { InMemoryPurchaseOrderRepository } from './in-memory-purchase-order-repository.js';
import type { PurchaseOrderRecord } from '../../domain/purchase-order/purchase-order-repository.js';
import {
  ItemId,
  PurchaseOrderId,
  PurchaseOrderStatus,
  Quantity,
  SupplierId,
} from '../../domain/shared/value-objects.js';
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';

describe('InMemoryPurchaseOrderRepository', () => {
  it('ステータスと単品 ID で発注を検索できる', async () => {
    const repository = new InMemoryPurchaseOrderRepository();
    repository.addRecord(createRecord({ purchaseOrderId: 1, itemId: 1, status: '発注済み' }));
    repository.addRecord(createRecord({ purchaseOrderId: 2, itemId: 2, status: '発注済み' }));
    repository.addRecord(createRecord({ purchaseOrderId: 3, itemId: 1, status: '入荷済み' }));

    await expect(repository.findByStatus('発注済み')).resolves.toHaveLength(2);
    await expect(repository.findByItemIdAndStatus(new ItemId(1), '発注済み')).resolves.toEqual([
      expect.objectContaining({ purchaseOrderId: 1 }),
    ]);
  });

  it('未採番の発注を保存すると自動採番して返す', async () => {
    const repository = new InMemoryPurchaseOrderRepository();
    const purchaseOrder = new PurchaseOrder({
      purchaseOrderId: undefined as unknown as PurchaseOrderId,
      itemId: new ItemId(1),
      supplierId: new SupplierId(2),
      quantity: new Quantity(100),
      orderDate: new Date('2026-03-18'),
      expectedArrivalDate: new Date('2026-03-21'),
      status: new PurchaseOrderStatus('発注済み'),
    });

    const saved = await repository.save(purchaseOrder);

    expect(saved.purchaseOrderId!.value).toBe(1);
    await expect(repository.findByStatus('発注済み')).resolves.toEqual([
      expect.objectContaining({
        purchaseOrderId: 1,
        itemId: 1,
        supplierId: 2,
        quantity: 100,
      }),
    ]);
  });
});

const createRecord = (overrides: Partial<PurchaseOrderRecord>): PurchaseOrderRecord => ({
  purchaseOrderId: 1,
  itemId: 1,
  supplierId: 1,
  quantity: 10,
  orderDate: new Date('2026-03-18'),
  expectedArrivalDate: new Date('2026-03-20'),
  status: '発注済み',
  ...overrides,
});
