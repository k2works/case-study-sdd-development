import { beforeEach, describe, expect, it, vi } from 'vitest';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPurchaseOrderRepository } from './purchase-order-repository-prisma.js';
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import {
  ItemId,
  PurchaseOrderStatus,
  PurchaseUnit,
  Quantity,
  SupplierId,
} from '../../domain/shared/value-objects.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev';

const pool = new pg.Pool({ connectionString: DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

describe('PrismaPurchaseOrderRepository（統合テスト）', () => {
  let repository: PrismaPurchaseOrderRepository;

  beforeEach(async () => {
    repository = new PrismaPurchaseOrderRepository(prisma);
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

    await prisma.item.createMany({
      data: [
        {
          itemId: 1,
          name: '赤バラ',
          qualityRetentionDays: 5,
          purchaseUnit: 100,
          leadTimeDays: 3,
          supplierId: 1,
        },
        {
          itemId: 2,
          name: '白バラ',
          qualityRetentionDays: 7,
          purchaseUnit: 50,
          leadTimeDays: 2,
          supplierId: 1,
        },
      ],
    });
  });

  it('save で新規発注を作成できる', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-18T00:00:00.000Z'));

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(120),
      purchaseUnit: new PurchaseUnit(100),
      leadTimeDays: 3,
      supplierId: new SupplierId(1),
    });

    const saved = await repository.save(purchaseOrder);

    expect(saved.purchaseOrderId!.value).toBeGreaterThan(0);
    expect(saved.itemId.value).toBe(1);
    expect(saved.quantity.value).toBe(200);
    expect(saved.status.value).toBe('発注済み');
    vi.useRealTimers();
  });

  it('findByStatus で指定ステータスの発注を取得できる', async () => {
    await prisma.purchaseOrder.createMany({
      data: [
        {
          purchaseOrderId: 1,
          itemId: 1,
          supplierId: 1,
          quantity: 100,
          orderDate: new Date('2026-03-18'),
          expectedArrivalDate: new Date('2026-03-21'),
          status: '発注済み',
        },
        {
          purchaseOrderId: 2,
          itemId: 2,
          supplierId: 1,
          quantity: 50,
          orderDate: new Date('2026-03-18'),
          expectedArrivalDate: new Date('2026-03-20'),
          status: '入荷済み',
        },
      ],
    });

    const records = await repository.findByStatus(new PurchaseOrderStatus('発注済み').value);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      purchaseOrderId: 1,
      itemId: 1,
      supplierId: 1,
      quantity: 100,
      status: '発注済み',
    });
  });

  it('findByItemIdAndStatus で特定単品の発注を取得できる', async () => {
    await prisma.purchaseOrder.createMany({
      data: [
        {
          purchaseOrderId: 1,
          itemId: 1,
          supplierId: 1,
          quantity: 100,
          orderDate: new Date('2026-03-18'),
          expectedArrivalDate: new Date('2026-03-21'),
          status: '発注済み',
        },
        {
          purchaseOrderId: 2,
          itemId: 1,
          supplierId: 1,
          quantity: 100,
          orderDate: new Date('2026-03-18'),
          expectedArrivalDate: new Date('2026-03-21'),
          status: '入荷済み',
        },
        {
          purchaseOrderId: 3,
          itemId: 2,
          supplierId: 1,
          quantity: 50,
          orderDate: new Date('2026-03-18'),
          expectedArrivalDate: new Date('2026-03-20'),
          status: '発注済み',
        },
      ],
    });

    const records = await repository.findByItemIdAndStatus(new ItemId(1), new PurchaseOrderStatus('発注済み').value);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      purchaseOrderId: 1,
      itemId: 1,
      status: '発注済み',
    });
  });
});
