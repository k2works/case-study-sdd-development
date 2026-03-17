import { describe, it, expect } from 'vitest';
import { PurchaseOrder } from './purchase-order.js';
import { PurchaseOrderId, PurchaseOrderStatus, ItemId, SupplierId, Quantity, PurchaseUnit, Days } from '../shared/value-objects.js';

describe('PurchaseOrder', () => {
  describe('createNew', () => {
    it('購入単位の倍数に切り上げて発注を作成する', () => {
      const po = PurchaseOrder.createNew({
        itemId: new ItemId(1),
        supplierId: new SupplierId(1),
        requestedQuantity: 25,
        purchaseUnit: new PurchaseUnit(10),
        leadTimeDays: new Days(2),
        orderDate: new Date('2026-04-07'),
      });

      expect(po.purchaseOrderId).toBeNull();
      expect(po.quantity.value).toBe(30); // 25 → 30（10の倍数に切り上げ）
      expect(po.status.value).toBe('発注済み');
      expect(po.expectedArrivalDate).toEqual(new Date('2026-04-09')); // +2日
    });

    it('購入単位ちょうどの場合は調整なし', () => {
      const po = PurchaseOrder.createNew({
        itemId: new ItemId(1),
        supplierId: new SupplierId(1),
        requestedQuantity: 30,
        purchaseUnit: new PurchaseUnit(10),
        leadTimeDays: new Days(3),
        orderDate: new Date('2026-04-07'),
      });

      expect(po.quantity.value).toBe(30);
      expect(po.expectedArrivalDate).toEqual(new Date('2026-04-10'));
    });

    it('1本単位でも正しく調整される', () => {
      const po = PurchaseOrder.createNew({
        itemId: new ItemId(1),
        supplierId: new SupplierId(1),
        requestedQuantity: 1,
        purchaseUnit: new PurchaseUnit(10),
        leadTimeDays: new Days(1),
        orderDate: new Date('2026-04-07'),
      });

      expect(po.quantity.value).toBe(10); // 1 → 10
    });
  });

  describe('receive', () => {
    it('発注済みから入荷済みに遷移できる', () => {
      const po = PurchaseOrder.createNew({
        itemId: new ItemId(1),
        supplierId: new SupplierId(1),
        requestedQuantity: 10,
        purchaseUnit: new PurchaseUnit(10),
        leadTimeDays: new Days(2),
        orderDate: new Date('2026-04-07'),
      });

      const received = po.receive();
      expect(received.status.value).toBe('入荷済み');
    });

    it('入荷済みから発注済みには遷移できない（不正遷移）', () => {
      const po = new PurchaseOrder({
        purchaseOrderId: new PurchaseOrderId(1),
        itemId: new ItemId(1),
        supplierId: new SupplierId(1),
        quantity: new Quantity(10),
        orderDate: new Date('2026-04-07'),
        expectedArrivalDate: new Date('2026-04-09'),
        status: new PurchaseOrderStatus('入荷済み'),
      });

      expect(() => po.receive()).toThrow('発注済みの発注のみ入荷済みに遷移できます');
    });
  });

  describe('イミュータブル', () => {
    it('receive は元のインスタンスを変更しない', () => {
      const po = PurchaseOrder.createNew({
        itemId: new ItemId(1),
        supplierId: new SupplierId(1),
        requestedQuantity: 10,
        purchaseUnit: new PurchaseUnit(10),
        leadTimeDays: new Days(2),
        orderDate: new Date('2026-04-07'),
      });

      po.receive();
      expect(po.status.value).toBe('発注済み');
    });
  });
});
