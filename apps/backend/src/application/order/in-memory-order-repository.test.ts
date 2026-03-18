import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryOrderRepository } from './in-memory-order-repository.js';
import { Order } from '../../domain/order/order.js';
import { DestinationSnapshot } from '../../domain/order/destination-snapshot.js';
import {
  CustomerId,
  DeliveryDate,
  Message,
  OrderStatus,
  Price,
  ProductId,
} from '../../domain/shared/value-objects.js';

describe('InMemoryOrderRepository', () => {
  let repository: InMemoryOrderRepository;

  beforeEach(() => {
    repository = new InMemoryOrderRepository();
  });

  it('複数ステータスで注文を取得できる', async () => {
    const ordered = await repository.save(createOrder(10));
    const prepared = await repository.save(createOrder(20));
    await repository.save(prepared.prepareShipment());
    const canceled = await repository.save(createOrder(30));
    await repository.save(canceled.cancel());

    const found = await repository.findByStatuses([
      new OrderStatus('注文済み'),
      new OrderStatus('出荷準備中'),
    ]);

    expect(found).toHaveLength(2);
    expect(found.map((order) => order.orderId!.value)).toEqual([ordered.orderId!.value, prepared.orderId!.value]);
  });
});

const createOrder = (customerId: number): Order =>
  Order.createNew({
    customerId: new CustomerId(customerId),
    productId: new ProductId(1),
    price: new Price(5500),
    destination: new DestinationSnapshot(`顧客${customerId}`, '東京都', '03-1111-1111'),
    deliveryDate: new DeliveryDate(new Date('2026-04-01')),
    message: new Message(''),
  });
