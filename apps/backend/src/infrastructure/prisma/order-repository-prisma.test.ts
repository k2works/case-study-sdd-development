import { describe, it, expect, beforeEach } from 'vitest';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaOrderRepository } from './order-repository-prisma.js';
import { Order } from '../../domain/order/order.js';
import { DestinationSnapshot } from '../../domain/order/destination-snapshot.js';
import { CustomerId, ProductId, Price, DeliveryDate, OrderStatus, Message } from '../../domain/shared/value-objects.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev';

const pool = new pg.Pool({ connectionString: DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

describe('PrismaOrderRepository（統合テスト）', () => {
  let repository: PrismaOrderRepository;

  beforeEach(async () => {
    repository = new PrismaOrderRepository(prisma);
    await prisma.stock.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productComposition.deleteMany();
    await prisma.product.deleteMany();
    await prisma.item.deleteMany();
    // テスト用仕入先・商品を作成
    await prisma.supplier.upsert({
      where: { supplierId: 1 },
      update: {},
      create: { supplierId: 1, name: 'テスト仕入先A', phone: '03-1234-5678' },
    });
    await prisma.product.upsert({
      where: { productId: 1 },
      update: {},
      create: { productId: 1, name: 'ローズブーケ', price: 5500 },
    });
  });

  it('受注を保存して取得できる', async () => {
    const order = Order.createNew({
      customerId: new CustomerId(10),
      productId: new ProductId(1),
      price: new Price(5500),
      destination: new DestinationSnapshot('田中太郎', '東京都渋谷区1-1-1', '03-1234-5678'),
      deliveryDate: new DeliveryDate(new Date('2026-04-01')),
      message: new Message('お誕生日おめでとうございます'),
    });

    const saved = await repository.save(order);
    expect(saved.orderId!.value).toBeGreaterThan(0);
    expect(saved.status.value).toBe('注文済み');

    const found = await repository.findById(saved.orderId!);
    expect(found).not.toBeNull();
    expect(found!.destination.name).toBe('田中太郎');
    expect(found!.price.value).toBe(5500);
  });

  it('全件取得できる', async () => {
    await repository.save(
      Order.createNew({
        customerId: new CustomerId(10),
        productId: new ProductId(1),
        price: new Price(5500),
        destination: new DestinationSnapshot('田中太郎', '東京都', '03-1111-1111'),
        deliveryDate: new DeliveryDate(new Date('2026-04-01')),
        message: new Message(''),
      }),
    );
    await repository.save(
      Order.createNew({
        customerId: new CustomerId(20),
        productId: new ProductId(1),
        price: new Price(5500),
        destination: new DestinationSnapshot('鈴木花子', '大阪府', '06-2222-2222'),
        deliveryDate: new DeliveryDate(new Date('2026-04-02')),
        message: new Message(''),
      }),
    );

    const orders = await repository.findAll();
    expect(orders).toHaveLength(2);
  });

  it('ステータスでフィルタできる', async () => {
    await repository.save(
      Order.createNew({
        customerId: new CustomerId(10),
        productId: new ProductId(1),
        price: new Price(5500),
        destination: new DestinationSnapshot('田中太郎', '東京都', '03-1111-1111'),
        deliveryDate: new DeliveryDate(new Date('2026-04-01')),
        message: new Message(''),
      }),
    );

    const ordered = await repository.findAll(new OrderStatus('注文済み'));
    expect(ordered).toHaveLength(1);

    const shipped = await repository.findAll(new OrderStatus('出荷済み'));
    expect(shipped).toHaveLength(0);
  });

  it('受注を更新できる', async () => {
    const saved = await repository.save(
      Order.createNew({
        customerId: new CustomerId(10),
        productId: new ProductId(1),
        price: new Price(5500),
        destination: new DestinationSnapshot('田中太郎', '東京都', '03-1111-1111'),
        deliveryDate: new DeliveryDate(new Date('2026-04-01')),
        message: new Message(''),
      }),
    );

    const prepared = saved.prepareShipment();
    await repository.save(prepared);

    const found = await repository.findById(saved.orderId!);
    expect(found!.status.value).toBe('出荷準備中');
  });

  it('存在しない ID は null を返す', async () => {
    const { OrderId } = await import('../../domain/shared/value-objects.js');
    const found = await repository.findById(new OrderId(99999));
    expect(found).toBeNull();
  });
});
