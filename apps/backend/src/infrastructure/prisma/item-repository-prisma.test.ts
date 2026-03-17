import { describe, it, expect, beforeEach } from 'vitest';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaItemRepository } from './item-repository-prisma.js';
import { Item } from '../../domain/item/item.js';
import { ItemName, Days, PurchaseUnit, SupplierId } from '../../domain/shared/value-objects.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev';

const pool = new pg.Pool({ connectionString: DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

describe('PrismaItemRepository（統合テスト）', () => {
  let repository: PrismaItemRepository;

  beforeEach(async () => {
    repository = new PrismaItemRepository(prisma);
    await prisma.productComposition.deleteMany();
    await prisma.item.deleteMany();
    // テスト用仕入先を作成（外部キー制約を満たすため）
    await prisma.supplier.upsert({
      where: { supplierId: 1 },
      update: {},
      create: { supplierId: 1, name: 'テスト仕入先A', phone: '03-1234-5678' },
    });
    await prisma.supplier.upsert({
      where: { supplierId: 2 },
      update: {},
      create: { supplierId: 2, name: 'テスト仕入先B', phone: '03-9876-5432' },
    });
  });

  it('単品を保存して取得できる', async () => {
    const item = Item.createNew({
      name: new ItemName('赤バラ'),
      qualityRetentionDays: new Days(5),
      purchaseUnit: new PurchaseUnit(100),
      leadTimeDays: new Days(3),
      supplierId: new SupplierId(1),
    });

    const saved = await repository.save(item);
    expect(saved.itemId.value).toBeGreaterThan(0);
    expect(saved.name.value).toBe('赤バラ');

    const found = await repository.findById(saved.itemId);
    expect(found).not.toBeNull();
    expect(found!.name.value).toBe('赤バラ');
  });

  it('全件取得できる', async () => {
    await repository.save(
      Item.createNew({
        name: new ItemName('赤バラ'),
        qualityRetentionDays: new Days(5),
        purchaseUnit: new PurchaseUnit(100),
        leadTimeDays: new Days(3),
        supplierId: new SupplierId(1),
      }),
    );
    await repository.save(
      Item.createNew({
        name: new ItemName('カスミソウ'),
        qualityRetentionDays: new Days(7),
        purchaseUnit: new PurchaseUnit(50),
        leadTimeDays: new Days(2),
        supplierId: new SupplierId(2),
      }),
    );

    const items = await repository.findAll();
    expect(items).toHaveLength(2);
  });

  it('単品を更新できる', async () => {
    const saved = await repository.save(
      Item.createNew({
        name: new ItemName('赤バラ'),
        qualityRetentionDays: new Days(5),
        purchaseUnit: new PurchaseUnit(100),
        leadTimeDays: new Days(3),
        supplierId: new SupplierId(1),
      }),
    );

    const updated = saved.changeName(new ItemName('白バラ'));
    await repository.save(updated);

    const found = await repository.findById(saved.itemId);
    expect(found!.name.value).toBe('白バラ');
  });

  it('存在しない ID は null を返す', async () => {
    const { ItemId } = await import('../../domain/shared/value-objects.js');
    const found = await repository.findById(new ItemId(99999));
    expect(found).toBeNull();
  });
});
