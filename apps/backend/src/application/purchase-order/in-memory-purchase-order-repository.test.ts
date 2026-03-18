import { describe, expect, it } from 'vitest';
import { InMemoryPurchaseOrderRepository } from './in-memory-purchase-order-repository.js';
import type { PurchaseOrderRecord } from '../../domain/purchase-order/purchase-order-repository.js';
import { ItemId } from '../../domain/shared/value-objects.js';

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
