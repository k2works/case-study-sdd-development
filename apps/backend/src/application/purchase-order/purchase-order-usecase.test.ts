import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PurchaseOrderUseCase } from './purchase-order-usecase.js';
import { InMemoryPurchaseOrderRepository } from './in-memory-purchase-order-repository.js';
import { Item } from '../../domain/item/item.js';
import { InMemoryItemRepository } from '../item/in-memory-item-repository.js';
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
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';

describe('PurchaseOrderUseCase', () => {
  let purchaseOrderRepository: InMemoryPurchaseOrderRepository;
  let itemRepository: InMemoryItemRepository;
  let useCase: PurchaseOrderUseCase;

  beforeEach(() => {
    purchaseOrderRepository = new InMemoryPurchaseOrderRepository();
    itemRepository = new InMemoryItemRepository();
    useCase = new PurchaseOrderUseCase(purchaseOrderRepository, itemRepository);
  });

  it('発注を作成できる', async () => {
    await itemRepository.save(createItem());

    const result = await useCase.createPurchaseOrder(1, 250);

    expect(result.purchaseOrderId).toBe(1);
    expect(result.itemId).toBe(1);
    expect(result.supplierId).toBe(10);
    expect(result.quantity).toBe(300);
    expect(result.status).toBe('発注済み');
  });

  it('入荷予定日を leadTimeDays から計算する', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-18T00:00:00.000Z'));
    await itemRepository.save(createItem({ leadTimeDays: 5 }));

    const result = await useCase.createPurchaseOrder(1, 100);

    expect(result.orderDate).toEqual(new Date('2026-03-18T00:00:00.000Z'));
    expect(result.expectedArrivalDate).toEqual(new Date('2026-03-23T00:00:00.000Z'));
    vi.useRealTimers();
  });

  it('存在しない単品 ID でエラーにする', async () => {
    await expect(useCase.createPurchaseOrder(999, 100)).rejects.toThrow('単品が見つかりません');
  });

  it('save された PurchaseOrder を返す', async () => {
    await itemRepository.save(createItem());
    const savedPurchaseOrder = new PurchaseOrder({
      purchaseOrderId: new PurchaseOrderId(99),
      itemId: new ItemId(1),
      supplierId: new SupplierId(10),
      quantity: new Quantity(300),
      orderDate: new Date('2026-03-18T00:00:00.000Z'),
      expectedArrivalDate: new Date('2026-03-21T00:00:00.000Z'),
      status: new PurchaseOrderStatus('発注済み'),
    });
    vi.spyOn(purchaseOrderRepository, 'save').mockResolvedValue(savedPurchaseOrder);

    const result = await useCase.createPurchaseOrder(1, 250);

    expect(result.purchaseOrderId).toBe(99);
    expect(result.quantity).toBe(300);
    expect(result.orderDate).toEqual(new Date('2026-03-18T00:00:00.000Z'));
  });
});

const createItem = (overrides?: { leadTimeDays?: number }): Item =>
  new Item({
    itemId: new ItemId(1),
    name: new ItemName('赤バラ'),
    qualityRetentionDays: new Days(5),
    purchaseUnit: new PurchaseUnit(100),
    leadTimeDays: new Days(overrides?.leadTimeDays ?? 3),
    supplierId: new SupplierId(10),
  });
