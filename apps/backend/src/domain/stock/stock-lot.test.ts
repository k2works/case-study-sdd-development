import { describe, it, expect } from 'vitest';
import { StockLot } from './stock-lot.js';
import { StockId, ItemId, Quantity, StockStatus, OrderId } from '../shared/value-objects.js';

describe('StockLot', () => {
  const createStockLot = (overrides?: Partial<{
    stockId: StockId | null;
    itemId: ItemId;
    quantity: Quantity;
    arrivalDate: Date;
    expiryDate: Date;
    status: StockStatus;
    orderId: OrderId | null;
  }>) =>
    new StockLot({
      stockId: new StockId(1),
      itemId: new ItemId(10),
      quantity: new Quantity(50),
      arrivalDate: new Date('2026-03-15'),
      expiryDate: new Date('2026-03-20'),
      status: new StockStatus('有効'),
      orderId: null,
      ...overrides,
    });

  it('正しいプロパティで生成できる', () => {
    const lot = createStockLot();

    expect(lot.stockId!.value).toBe(1);
    expect(lot.itemId.value).toBe(10);
    expect(lot.quantity.value).toBe(50);
    expect(lot.arrivalDate).toEqual(new Date('2026-03-15'));
    expect(lot.expiryDate).toEqual(new Date('2026-03-20'));
    expect(lot.status.value).toBe('有効');
    expect(lot.orderId).toBeNull();
  });

  it('createNew で新規ロットを作成できる', () => {
    const lot = StockLot.createNew({
      itemId: new ItemId(10),
      quantity: new Quantity(50),
      arrivalDate: new Date('2026-03-15'),
      expiryDate: new Date('2026-03-20'),
    });

    expect(lot.stockId).toBeNull();
    expect(lot.status.value).toBe('有効');
    expect(lot.orderId).toBeNull();
  });

  it('引当できる（有効 → 引当済み）', () => {
    const lot = createStockLot();
    const allocated = lot.allocate(new OrderId(100));

    expect(allocated.status.value).toBe('引当済み');
    expect(allocated.orderId!.value).toBe(100);
  });

  it('有効以外のロットは引当できない', () => {
    const lot = createStockLot({ status: new StockStatus('引当済み'), orderId: new OrderId(1) });

    expect(() => lot.allocate(new OrderId(100))).toThrow();
  });

  it('ロットを分割できる', () => {
    const lot = createStockLot({ quantity: new Quantity(50) });
    const [allocated, remaining] = lot.split(new Quantity(20));
    expect(remaining).not.toBeNull();

    expect(allocated.quantity.value).toBe(20);
    expect(remaining!.quantity.value).toBe(30);
    expect(allocated.stockId).toBeNull();
    expect(remaining!.stockId).toBeNull();
  });

  it('全量と同じ数量で分割すると残りがない', () => {
    const lot = createStockLot({ quantity: new Quantity(50) });
    const [allocated, remaining] = lot.split(new Quantity(50));

    expect(allocated.quantity.value).toBe(50);
    expect(remaining).toBeNull();
  });

  it('在庫数量を超える分割はエラー', () => {
    const lot = createStockLot({ quantity: new Quantity(50) });

    expect(() => lot.split(new Quantity(51))).toThrow();
  });

  it('消費できる（引当済み → 消費済み）', () => {
    const lot = createStockLot({ status: new StockStatus('引当済み'), orderId: new OrderId(1) });
    const consumed = lot.consume();

    expect(consumed.status.value).toBe('消費済み');
  });

  it('引当済み以外のロットは消費できない', () => {
    const lot = createStockLot();

    expect(() => lot.consume()).toThrow();
  });

  it('期限切れにできる（有効 → 期限切れ）', () => {
    const lot = createStockLot();
    const expired = lot.markAsExpired();

    expect(expired.status.value).toBe('期限切れ');
  });

  it('有効以外のロットは期限切れにできない', () => {
    const lot = createStockLot({ status: new StockStatus('引当済み'), orderId: new OrderId(1) });

    expect(() => lot.markAsExpired()).toThrow();
  });

  it('元のインスタンスは変更されない（イミュータブル）', () => {
    const lot = createStockLot();
    lot.allocate(new OrderId(100));

    expect(lot.status.value).toBe('有効');
    expect(lot.orderId).toBeNull();
  });
});
