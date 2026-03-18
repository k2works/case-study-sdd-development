import { describe, it, expect, beforeEach } from 'vitest';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaStockLotRepository } from './stock-lot-repository-prisma.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { ItemId, Quantity, StockId, StockStatus } from '../../domain/shared/value-objects.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev';

const pool = new pg.Pool({ connectionString: DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

describe('PrismaStockLotRepository（統合テスト）', () => {
  let repository: PrismaStockLotRepository;

  beforeEach(async () => {
    repository = new PrismaStockLotRepository(prisma);
    await prisma.purchaseOrder.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.productComposition.deleteMany();
    await prisma.product.deleteMany();
    await prisma.item.deleteMany();
    // テスト用仕入先・単品を作成
    await prisma.supplier.upsert({
      where: { supplierId: 1 },
      update: {},
      create: { supplierId: 1, name: 'テスト仕入先A', phone: '03-1234-5678' },
    });
    await prisma.item.upsert({
      where: { itemId: 1 },
      update: {},
      create: { itemId: 1, name: '赤バラ', qualityRetentionDays: 5, purchaseUnit: 100, leadTimeDays: 3, supplierId: 1 },
    });
    await prisma.item.upsert({
      where: { itemId: 2 },
      update: {},
      create: { itemId: 2, name: 'カスミソウ', qualityRetentionDays: 14, purchaseUnit: 200, leadTimeDays: 1, supplierId: 1 },
    });
  });

  it('在庫ロットを保存して取得できる', async () => {
    const lot = StockLot.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(50),
      arrivalDate: new Date('2026-03-15'),
      expiryDate: new Date('2026-03-20'),
    });

    const saved = await repository.save(lot);
    expect(saved.stockId!.value).toBeGreaterThan(0);
    expect(saved.status.value).toBe('有効');

    const found = await repository.findById(saved.stockId!);
    expect(found).not.toBeNull();
    expect(found!.quantity.value).toBe(50);
  });

  it('単品IDとステータスで検索できる', async () => {
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(50),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-20'),
      }),
    );
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(2),
        quantity: new Quantity(30),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-25'),
      }),
    );

    const roseLots = await repository.findByItemIdAndStatus(new ItemId(1), new StockStatus('有効'));
    expect(roseLots).toHaveLength(1);
    expect(roseLots[0].itemId.value).toBe(1);
  });

  it('有効在庫を単品 ID ごとに有効期限順で取得できる', async () => {
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(10),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-22'),
      }),
    );
    const expiringLot = await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(5),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-18'),
      }),
    );
    await repository.save(expiringLot.markAsExpired());
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(8),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-20'),
      }),
    );

    const lots = await repository.findActiveByItemId(new ItemId(1));

    expect(lots).toHaveLength(2);
    expect(lots.map((lot) => lot.expiryDate.toISOString().slice(0, 10))).toEqual([
      '2026-03-20',
      '2026-03-22',
    ]);
  });

  it('全単品の有効在庫を単品 ID と有効期限順で取得できる', async () => {
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(2),
        quantity: new Quantity(20),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-25'),
      }),
    );
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(10),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-22'),
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
    await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(8),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-20'),
      }),
    );

    const lots = await repository.findAllActive();

    expect(lots).toHaveLength(3);
    expect(
      lots.map((lot) => ({
        itemId: lot.itemId.value,
        expiryDate: lot.expiryDate.toISOString().slice(0, 10),
      })),
    ).toEqual([
      { itemId: 1, expiryDate: '2026-03-20' },
      { itemId: 1, expiryDate: '2026-03-22' },
      { itemId: 2, expiryDate: '2026-03-25' },
    ]);
  });

  it('在庫ロットを更新できる', async () => {
    const saved = await repository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(50),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-20'),
      }),
    );

    const expired = saved.markAsExpired();
    await repository.save(expired);

    const found = await repository.findById(saved.stockId!);
    expect(found!.status.value).toBe('期限切れ');
  });

  it('複数ロットを一括保存できる', async () => {
    const lots = [
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(50),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-03-20'),
      }),
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(30),
        arrivalDate: new Date('2026-03-16'),
        expiryDate: new Date('2026-03-21'),
      }),
    ];

    const saved = await repository.saveAll(lots);
    expect(saved).toHaveLength(2);
    expect(saved[0].stockId!.value).toBeGreaterThan(0);
    expect(saved[1].stockId!.value).toBeGreaterThan(0);
  });

  it('存在しない ID は null を返す', async () => {
    const found = await repository.findById(new StockId(99999));
    expect(found).toBeNull();
  });
});
