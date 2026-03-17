import { describe, it, expect } from 'vitest';
import { ItemId, ItemName, Days, PurchaseUnit, SupplierId } from './value-objects.js';

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
