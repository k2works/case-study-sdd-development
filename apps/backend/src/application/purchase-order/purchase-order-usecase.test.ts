import { describe, it, expect, beforeEach } from 'vitest';
import { PurchaseOrderUseCase } from './purchase-order-usecase.js';
import { InMemoryPurchaseOrderRepository } from './in-memory-purchase-order-repository.js';
import { InMemoryItemRepository } from '../item/in-memory-item-repository.js';
import { Item } from '../../domain/item/item.js';
import { ItemId, ItemName, Days, PurchaseUnit, SupplierId } from '../../domain/shared/value-objects.js';

describe('PurchaseOrderUseCase', () => {
  let useCase: PurchaseOrderUseCase;
  let purchaseOrderRepo: InMemoryPurchaseOrderRepository;
  let itemRepo: InMemoryItemRepository;

  beforeEach(async () => {
    purchaseOrderRepo = new InMemoryPurchaseOrderRepository();
    itemRepo = new InMemoryItemRepository();
    useCase = new PurchaseOrderUseCase(purchaseOrderRepo, itemRepo);

    await itemRepo.save(new Item({
      itemId: new ItemId(1),
      name: new ItemName('赤バラ'),
      qualityRetentionDays: new Days(5),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: new Days(2),
      supplierId: new SupplierId(1),
    }));
  });

  it('発注を作成できる（購入単位倍数に調整）', async () => {
    const result = await useCase.createPurchaseOrder({
      itemId: 1,
      quantity: 25,
    });

    expect(result.id).toBe(1);
    expect(result.itemId).toBe(1);
    expect(result.supplierId).toBe(1);
    expect(result.quantity).toBe(30); // 25 → 30（10の倍数に切り上げ）
    expect(result.status).toBe('発注済み');
  });

  it('存在しない単品の場合はエラー', async () => {
    await expect(
      useCase.createPurchaseOrder({ itemId: 999, quantity: 10 }),
    ).rejects.toThrow('単品が見つかりません');
  });
});
