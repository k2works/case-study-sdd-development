import { describe, it, expect } from 'vitest';
import { Item } from './item.js';
import { ItemId, ItemName, Days, PurchaseUnit, SupplierId } from '../shared/value-objects.js';

describe('Item', () => {
  const createItem = (overrides?: Partial<{
    itemId: ItemId;
    name: ItemName;
    qualityRetentionDays: Days;
    purchaseUnit: PurchaseUnit;
    leadTimeDays: Days;
    supplierId: SupplierId;
  }>) =>
    new Item({
      itemId: new ItemId(1),
      name: new ItemName('赤バラ'),
      qualityRetentionDays: new Days(5),
      purchaseUnit: new PurchaseUnit(100),
      leadTimeDays: new Days(3),
      supplierId: new SupplierId(1),
      ...overrides,
    });

  it('正しいプロパティで生成できる', () => {
    const item = createItem();

    expect(item.itemId!.value).toBe(1);
    expect(item.name.value).toBe('赤バラ');
    expect(item.qualityRetentionDays.value).toBe(5);
    expect(item.purchaseUnit.value).toBe(100);
    expect(item.leadTimeDays.value).toBe(3);
    expect(item.supplierId.value).toBe(1);
  });

  it('名前を変更できる', () => {
    const item = createItem();
    const updated = item.changeName(new ItemName('白バラ'));

    expect(updated.name.value).toBe('白バラ');
    expect(updated.itemId!.value).toBe(1);
  });

  it('品質維持日数を変更できる', () => {
    const item = createItem();
    const updated = item.changeQualityRetentionDays(new Days(7));

    expect(updated.qualityRetentionDays.value).toBe(7);
  });

  it('購入単位を変更できる', () => {
    const item = createItem();
    const updated = item.changePurchaseUnit(new PurchaseUnit(50));

    expect(updated.purchaseUnit.value).toBe(50);
  });

  it('リードタイムを変更できる', () => {
    const item = createItem();
    const updated = item.changeLeadTimeDays(new Days(5));

    expect(updated.leadTimeDays.value).toBe(5);
  });

  it('仕入先を変更できる', () => {
    const item = createItem();
    const updated = item.changeSupplierId(new SupplierId(2));

    expect(updated.supplierId.value).toBe(2);
  });

  it('元のインスタンスは変更されない（イミュータブル）', () => {
    const item = createItem();
    item.changeName(new ItemName('白バラ'));

    expect(item.name.value).toBe('赤バラ');
  });
});
