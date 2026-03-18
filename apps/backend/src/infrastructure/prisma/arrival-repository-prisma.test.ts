import { beforeEach, describe, expect, it } from 'vitest';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaArrivalRepository } from './arrival-repository-prisma.js';
import { Arrival } from '../../domain/arrival/arrival.js';
import {
  ItemId,
  PurchaseOrderId,
  Quantity,
} from '../../domain/shared/value-objects.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev';

const pool = new pg.Pool({ connectionString: DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

describe('PrismaArrivalRepository（統合テスト）', () => {
  let repository: PrismaArrivalRepository;

  beforeEach(async () => {
    repository = new PrismaArrivalRepository(prisma);
    await prisma.arrival.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.productComposition.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.item.deleteMany();
    await prisma.supplier.deleteMany();

    await prisma.supplier.create({
      data: { supplierId: 1, name: 'テスト仕入先', phone: '03-1234-5678' },
    });

    await prisma.item.create({
      data: {
        itemId: 1,
        name: '赤バラ',
        qualityRetentionDays: 7,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      },
    });

    await prisma.purchaseOrder.create({
      data: {
        purchaseOrderId: 1,
        itemId: 1,
        supplierId: 1,
        quantity: 100,
        orderDate: new Date('2026-03-15'),
        expectedArrivalDate: new Date('2026-03-18'),
        status: '発注済み',
      },
    });
  });

  it('save で新規入荷を作成できる', async () => {
    const arrival = Arrival.createNew({
      itemId: new ItemId(1),
      purchaseOrderId: new PurchaseOrderId(1),
      quantity: new Quantity(100),
      arrivalDate: new Date('2026-03-18'),
    });

    const saved = await repository.save(arrival);

    expect(saved.arrivalId).not.toBeNull();
    expect(saved.arrivalId!.value).toBeGreaterThan(0);
    expect(saved.itemId.value).toBe(1);
    expect(saved.purchaseOrderId.value).toBe(1);
    expect(saved.quantity.value).toBe(100);
  });

  it('save で既存入荷を更新できる', async () => {
    const arrival = Arrival.createNew({
      itemId: new ItemId(1),
      purchaseOrderId: new PurchaseOrderId(1),
      quantity: new Quantity(100),
      arrivalDate: new Date('2026-03-18'),
    });

    const saved = await repository.save(arrival);

    const updated = new Arrival({
      ...saved,
      quantity: new Quantity(200),
    });

    const result = await repository.save(updated);

    expect(result.arrivalId!.value).toBe(saved.arrivalId!.value);
    expect(result.quantity.value).toBe(200);
  });
});
