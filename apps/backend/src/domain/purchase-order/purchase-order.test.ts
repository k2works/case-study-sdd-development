import { describe, it, expect, vi, afterEach } from 'vitest';
import { PurchaseOrder } from './purchase-order.js';
import {
  ItemId,
  PurchaseOrderId,
  PurchaseOrderStatus,
  PurchaseUnit,
  Quantity,
  SupplierId,
} from '../shared/value-objects.js';

describe('PurchaseOrder', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const baseDate = new Date('2026-03-18T00:00:00.000Z');

  const createPurchaseOrder = (overrides?: Partial<{
    purchaseOrderId: PurchaseOrderId;
    itemId: ItemId;
    supplierId: SupplierId;
    quantity: Quantity;
    orderDate: Date;
    expectedArrivalDate: Date;
    status: PurchaseOrderStatus;
  }>) =>
    new PurchaseOrder({
      purchaseOrderId: new PurchaseOrderId(1),
      itemId: new ItemId(1),
      supplierId: new SupplierId(10),
      quantity: new Quantity(10),
      orderDate: baseDate,
      expectedArrivalDate: new Date('2026-03-21T00:00:00.000Z'),
      status: new PurchaseOrderStatus('発注済み'),
      ...overrides,
    });

  it('createNew で購入単位の倍数に切り上げられる', () => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(7),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: 3,
      supplierId: new SupplierId(10),
    });

    expect(purchaseOrder.quantity.value).toBe(10);
  });

  it('createNew で購入単位 - 1 の数量が購入単位に切り上げられる（境界値: 9→10）', () => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(9),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: 3,
      supplierId: new SupplierId(10),
    });

    expect(purchaseOrder.quantity.value).toBe(10);
  });

  it('createNew で購入単位ちょうどの数量はそのまま（境界値: 10→10）', () => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(10),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: 3,
      supplierId: new SupplierId(10),
    });

    expect(purchaseOrder.quantity.value).toBe(10);
  });

  it('createNew で購入単位 + 1 の数量が次の倍数に切り上げられる（境界値: 11→20）', () => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(11),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: 3,
      supplierId: new SupplierId(10),
    });

    expect(purchaseOrder.quantity.value).toBe(20);
  });

  it('createNew で既に倍数の場合はそのままになる', () => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(20),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: 3,
      supplierId: new SupplierId(10),
    });

    expect(purchaseOrder.quantity.value).toBe(20);
  });

  it('createNew で入荷予定日が orderDate + leadTimeDays になる', () => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(10),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: 3,
      supplierId: new SupplierId(10),
    });

    expect(purchaseOrder.orderDate).toEqual(baseDate);
    expect(purchaseOrder.expectedArrivalDate).toEqual(new Date('2026-03-21T00:00:00.000Z'));
  });

  it('createNew で status が 発注済み になる', () => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(10),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: 3,
      supplierId: new SupplierId(10),
    });

    expect(purchaseOrder.status.value).toBe('発注済み');
  });

  it('receive で全量入荷の場合 status が 入荷済み に遷移する', () => {
    const purchaseOrder = createPurchaseOrder({ quantity: new Quantity(100) });

    const received = purchaseOrder.receive(100);

    expect(received.status.value).toBe('入荷済み');
  });

  it('receive で入荷数量 = 発注数量（境界値: ちょうど）', () => {
    const purchaseOrder = createPurchaseOrder({ quantity: new Quantity(10) });

    const received = purchaseOrder.receive(10);

    expect(received.status.value).toBe('入荷済み');
  });

  it('receive で入荷数量 < 発注数量はエラー（部分入荷非対応）', () => {
    const purchaseOrder = createPurchaseOrder({ quantity: new Quantity(10) });

    expect(() => purchaseOrder.receive(9)).toThrow('入荷数量は発注数量と一致する必要があります');
  });

  it('receive で入荷数量 > 発注数量はエラー（超過入荷非対応）', () => {
    const purchaseOrder = createPurchaseOrder({ quantity: new Quantity(10) });

    expect(() => purchaseOrder.receive(11)).toThrow('入荷数量は発注数量と一致する必要があります');
  });

  it('receive で入荷数量 0 はエラー', () => {
    const purchaseOrder = createPurchaseOrder({ quantity: new Quantity(10) });

    expect(() => purchaseOrder.receive(0)).toThrow('入荷数量は発注数量と一致する必要があります');
  });

  it('入荷済みから receive を呼ぶとエラーになる（二重入荷防止）', () => {
    const purchaseOrder = createPurchaseOrder({
      status: new PurchaseOrderStatus('入荷済み'),
    });

    expect(() => purchaseOrder.receive(10)).toThrow('既に入荷済みです');
  });

  it('createNew で supplierId が Item から引き継がれる', () => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(10),
      purchaseUnit: new PurchaseUnit(10),
      leadTimeDays: 3,
      supplierId: new SupplierId(99),
    });

    expect(purchaseOrder.supplierId.value).toBe(99);
  });
});
