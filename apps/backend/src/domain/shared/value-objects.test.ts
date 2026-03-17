import { describe, it, expect } from 'vitest';
import { ItemId, ItemName, Days, PurchaseUnit, SupplierId, ProductId, ProductName, Price, Quantity, OrderId, CustomerId, DeliveryDate, ShippingDate, OrderStatus, Message, StockId, StockStatus, PurchaseOrderId, PurchaseOrderStatus } from './value-objects.js';

describe('ItemId', () => {
  it('正の整数で生成できる', () => {
    const id = new ItemId(1);
    expect(id.value).toBe(1);
  });

  it('0以下の値はエラー', () => {
    expect(() => new ItemId(0)).toThrow();
    expect(() => new ItemId(-1)).toThrow();
  });

  it('同じ値を持つ ItemId は等しい', () => {
    expect(new ItemId(1).equals(new ItemId(1))).toBe(true);
    expect(new ItemId(1).equals(new ItemId(2))).toBe(false);
  });
});

describe('ItemName', () => {
  it('空でない文字列で生成できる', () => {
    const name = new ItemName('赤バラ');
    expect(name.value).toBe('赤バラ');
  });

  it('空文字列はエラー', () => {
    expect(() => new ItemName('')).toThrow();
  });

  it('100文字を超える文字列はエラー', () => {
    expect(() => new ItemName('あ'.repeat(101))).toThrow();
  });
});

describe('Days', () => {
  it('0以上の整数で生成できる', () => {
    const days = new Days(5);
    expect(days.value).toBe(5);
  });

  it('0は許可される', () => {
    const days = new Days(0);
    expect(days.value).toBe(0);
  });

  it('負の値はエラー', () => {
    expect(() => new Days(-1)).toThrow();
  });
});

describe('PurchaseUnit', () => {
  it('正の整数で生成できる', () => {
    const unit = new PurchaseUnit(100);
    expect(unit.value).toBe(100);
  });

  it('0以下の値はエラー', () => {
    expect(() => new PurchaseUnit(0)).toThrow();
    expect(() => new PurchaseUnit(-1)).toThrow();
  });
});

describe('SupplierId', () => {
  it('正の整数で生成できる', () => {
    const id = new SupplierId(1);
    expect(id.value).toBe(1);
  });

  it('0以下の値はエラー', () => {
    expect(() => new SupplierId(0)).toThrow();
  });
});

describe('ProductId', () => {
  it('正の整数で生成できる', () => {
    expect(new ProductId(1).value).toBe(1);
  });

  it('0以下の値はエラー', () => {
    expect(() => new ProductId(0)).toThrow();
  });
});

describe('ProductName', () => {
  it('空でない文字列で生成できる', () => {
    expect(new ProductName('ローズブーケ').value).toBe('ローズブーケ');
  });

  it('空文字列はエラー', () => {
    expect(() => new ProductName('')).toThrow();
  });

  it('100文字を超える文字列はエラー', () => {
    expect(() => new ProductName('あ'.repeat(101))).toThrow();
  });
});

describe('Price', () => {
  it('正の整数で生成できる', () => {
    expect(new Price(5500).value).toBe(5500);
  });

  it('0以下の値はエラー', () => {
    expect(() => new Price(0)).toThrow();
    expect(() => new Price(-100)).toThrow();
  });
});

describe('Quantity', () => {
  it('正の整数で生成できる', () => {
    expect(new Quantity(3).value).toBe(3);
  });

  it('0以下の値はエラー', () => {
    expect(() => new Quantity(0)).toThrow();
  });
});

describe('OrderId', () => {
  it('正の整数で生成できる', () => {
    expect(new OrderId(1).value).toBe(1);
  });

  it('0以下の値はエラー', () => {
    expect(() => new OrderId(0)).toThrow();
    expect(() => new OrderId(-1)).toThrow();
  });

  it('同じ値を持つ OrderId は等しい', () => {
    expect(new OrderId(1).equals(new OrderId(1))).toBe(true);
    expect(new OrderId(1).equals(new OrderId(2))).toBe(false);
  });
});

describe('CustomerId', () => {
  it('正の整数で生成できる', () => {
    expect(new CustomerId(1).value).toBe(1);
  });

  it('0以下の値はエラー', () => {
    expect(() => new CustomerId(0)).toThrow();
  });
});

describe('DeliveryDate', () => {
  it('日付で生成できる', () => {
    const date = new Date('2026-04-01');
    expect(new DeliveryDate(date).value).toEqual(date);
  });

  it('過去日付はエラー', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    expect(() => new DeliveryDate(yesterday)).toThrow('DeliveryDate は過去の日付にできません');
  });

  it('当日は許可される', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(() => new DeliveryDate(today)).not.toThrow();
  });
});

describe('ShippingDate', () => {
  it('配送日の前日で生成できる', () => {
    const deliveryDate = new DeliveryDate(new Date('2026-04-01'));
    const shippingDate = ShippingDate.fromDeliveryDate(deliveryDate);
    expect(shippingDate.value).toEqual(new Date('2026-03-31'));
  });
});

describe('OrderStatus', () => {
  it('有効なステータスで生成できる', () => {
    expect(new OrderStatus('注文済み').value).toBe('注文済み');
    expect(new OrderStatus('出荷準備中').value).toBe('出荷準備中');
    expect(new OrderStatus('出荷済み').value).toBe('出荷済み');
    expect(new OrderStatus('キャンセル').value).toBe('キャンセル');
  });

  it('無効なステータスはエラー', () => {
    expect(() => new OrderStatus('不明' as never)).toThrow();
  });
});

describe('Message', () => {
  it('空文字列で生成できる', () => {
    expect(new Message('').value).toBe('');
  });

  it('500文字以内で生成できる', () => {
    const msg = 'あ'.repeat(500);
    expect(new Message(msg).value).toBe(msg);
  });

  it('500文字を超えるとエラー', () => {
    expect(() => new Message('あ'.repeat(501))).toThrow();
  });

  it('null/undefined は空文字列として扱う', () => {
    expect(new Message(null as unknown as string).value).toBe('');
    expect(new Message(undefined as unknown as string).value).toBe('');
  });
});

describe('StockId', () => {
  it('正の整数で生成できる', () => {
    expect(new StockId(1).value).toBe(1);
  });

  it('0以下の値はエラー', () => {
    expect(() => new StockId(0)).toThrow();
  });

  it('同じ値を持つ StockId は等しい', () => {
    expect(new StockId(1).equals(new StockId(1))).toBe(true);
    expect(new StockId(1).equals(new StockId(2))).toBe(false);
  });
});

describe('StockStatus', () => {
  it('有効なステータスで生成できる', () => {
    expect(new StockStatus('有効').value).toBe('有効');
    expect(new StockStatus('引当済み').value).toBe('引当済み');
    expect(new StockStatus('消費済み').value).toBe('消費済み');
    expect(new StockStatus('期限切れ').value).toBe('期限切れ');
  });

  it('無効なステータスはエラー', () => {
    expect(() => new StockStatus('不明' as never)).toThrow();
  });
});

describe('PurchaseOrderId', () => {
  it('正の整数で生成できる', () => {
    expect(new PurchaseOrderId(1).value).toBe(1);
  });

  it('0以下の値はエラー', () => {
    expect(() => new PurchaseOrderId(0)).toThrow();
    expect(() => new PurchaseOrderId(-1)).toThrow();
  });

  it('同じ値を持つ PurchaseOrderId は等しい', () => {
    expect(new PurchaseOrderId(1).equals(new PurchaseOrderId(1))).toBe(true);
    expect(new PurchaseOrderId(1).equals(new PurchaseOrderId(2))).toBe(false);
  });
});

describe('PurchaseOrderStatus', () => {
  it('有効なステータスで生成できる', () => {
    expect(new PurchaseOrderStatus('発注済み').value).toBe('発注済み');
    expect(new PurchaseOrderStatus('入荷済み').value).toBe('入荷済み');
  });

  it('無効なステータスはエラー', () => {
    expect(() => new PurchaseOrderStatus('不明' as never)).toThrow();
  });
});
