import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryStockLotRepository } from './in-memory-stock-lot-repository.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { ItemId, Quantity } from '../../domain/shared/value-objects.js';

describe('InMemoryStockLotRepository', () => {
  let repository: InMemoryStockLotRepository;

  beforeEach(() => {
    repository = new InMemoryStockLotRepository();
  });

  it('単品 ID ごとに有効在庫だけを取得できる', async () => {
    const activeLot = await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(10),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-20'),
      }),
    );
    await repository.save(activeLot.markAsExpired());
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(8),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-22'),
      }),
    );
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(2),
        quantity: new Quantity(20),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-25'),
      }),
    );

    const lots = await repository.findActiveByItemId(new ItemId(1));

    expect(lots).toHaveLength(1);
    expect(lots[0].itemId.value).toBe(1);
    expect(lots[0].status.value).toBe('有効');
  });

  it('全単品の有効在庫だけを取得できる', async () => {
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(10),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-20'),
      }),
    );
    const expiredLot = await repository.save(
      StockLot.createNew({
        itemId: new ItemId(2),
        quantity: new Quantity(5),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-18'),
      }),
    );
    await repository.save(expiredLot.markAsExpired());

    const lots = await repository.findAllActive();

    expect(lots).toHaveLength(1);
    expect(lots[0].status.value).toBe('有効');
  });
});
