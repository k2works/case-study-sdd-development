import { describe, it, expect, beforeEach } from 'vitest';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaProductRepository } from './product-repository-prisma.js';
import { Product, ProductComposition } from '../../domain/product/product.js';
import { ProductId, ProductName, Price, ItemId, Quantity } from '../../domain/shared/value-objects.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev';

const pool = new pg.Pool({ connectionString: DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

describe('PrismaProductRepository（統合テスト）', () => {
  let repository: PrismaProductRepository;

  beforeEach(async () => {
    repository = new PrismaProductRepository(prisma);
    await prisma.arrival.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.productComposition.deleteMany();
    await prisma.product.deleteMany();
    await prisma.item.deleteMany();
    // テスト用仕入先を作成（外部キー制約を満たすため）
    await prisma.supplier.upsert({
      where: { supplierId: 1 },
      update: {},
      create: { supplierId: 1, name: 'テスト仕入先A', phone: '03-1234-5678' },
    });
    // テスト用単品を作成（upsert で冪等に）
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

  it('商品を保存して取得できる', async () => {
    const product = Product.createNew({
      name: new ProductName('ローズブーケ'),
      price: new Price(5500),
      compositions: [
        new ProductComposition(new ItemId(1), new Quantity(5)),
        new ProductComposition(new ItemId(2), new Quantity(3)),
      ],
    });

    const saved = await repository.save(product);
    expect(saved.productId!.value).toBeGreaterThan(0);
    expect(saved.compositions).toHaveLength(2);

    const found = await repository.findById(saved.productId!);
    expect(found).not.toBeNull();
    expect(found!.name.value).toBe('ローズブーケ');
    expect(found!.compositions).toHaveLength(2);
  });

  it('全件取得できる', async () => {
    await repository.save(
      Product.createNew({
        name: new ProductName('ローズブーケ'),
        price: new Price(5500),
        compositions: [],
      }),
    );
    await repository.save(
      Product.createNew({
        name: new ProductName('スプリングミックス'),
        price: new Price(3800),
        compositions: [],
      }),
    );

    const products = await repository.findAll();
    expect(products).toHaveLength(2);
  });

  it('商品の構成を更新できる', async () => {
    const saved = await repository.save(
      Product.createNew({
        name: new ProductName('ローズブーケ'),
        price: new Price(5500),
        compositions: [new ProductComposition(new ItemId(1), new Quantity(5))],
      }),
    );

    const updated = saved.changeCompositions([
      new ProductComposition(new ItemId(2), new Quantity(10)),
    ]);
    await repository.save(updated);

    const found = await repository.findById(saved.productId!);
    expect(found!.compositions).toHaveLength(1);
    expect(found!.compositions[0].itemId.value).toBe(2);
    expect(found!.compositions[0].quantity.value).toBe(10);
  });

  it('存在しない ID は null を返す', async () => {
    const found = await repository.findById(new ProductId(99999));
    expect(found).toBeNull();
  });
});
