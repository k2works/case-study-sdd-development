import { describe, it, expect } from 'vitest';
import { Arrival } from './arrival.js';
import { ArrivalId, ItemId, PurchaseOrderId, Quantity } from '../shared/value-objects.js';

describe('Arrival', () => {
  const validProps = {
    arrivalId: new ArrivalId(1),
    itemId: new ItemId(1),
    purchaseOrderId: new PurchaseOrderId(1),
    quantity: new Quantity(100),
    arrivalDate: new Date('2026-04-15'),
  };

  it('有効なプロパティで生成できる', () => {
    const arrival = new Arrival(validProps);
    expect(arrival.arrivalId?.value).toBe(1);
    expect(arrival.itemId.value).toBe(1);
    expect(arrival.purchaseOrderId.value).toBe(1);
    expect(arrival.quantity.value).toBe(100);
    expect(arrival.arrivalDate).toEqual(new Date('2026-04-15'));
  });

  it('createNew で arrivalId が null の Arrival を生成できる', () => {
    const arrival = Arrival.createNew({
      itemId: new ItemId(1),
      purchaseOrderId: new PurchaseOrderId(1),
      quantity: new Quantity(100),
      arrivalDate: new Date('2026-04-15'),
    });
    expect(arrival.arrivalId).toBeNull();
    expect(arrival.itemId.value).toBe(1);
    expect(arrival.purchaseOrderId.value).toBe(1);
    expect(arrival.quantity.value).toBe(100);
  });

  it('quantity が 0 以下はエラー', () => {
    expect(() => new Quantity(0)).toThrow();
    expect(() => new Quantity(-1)).toThrow();
  });
});
