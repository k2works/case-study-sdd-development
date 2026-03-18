import { describe, it, expect, beforeEach } from 'vitest';
import { ShipmentUseCase } from './shipment-usecase.js';
import { InMemoryOrderRepository } from '../order/in-memory-order-repository.js';
import { InMemoryProductRepository } from '../product/in-memory-product-repository.js';
import { InMemoryItemRepository } from '../item/in-memory-item-repository.js';
import { Order } from '../../domain/order/order.js';
import { Product, ProductComposition } from '../../domain/product/product.js';
import { Item } from '../../domain/item/item.js';
import { DestinationSnapshot } from '../../domain/order/destination-snapshot.js';
import {
  CustomerId,
  Days,
  DeliveryDate,
  ItemId,
  ItemName,
  Message,
  OrderId,
  OrderStatus,
  Price,
  ProductId,
  ProductName,
  PurchaseUnit,
  Quantity,
  SupplierId,
} from '../../domain/shared/value-objects.js';

describe('ShipmentUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let productRepository: InMemoryProductRepository;
  let itemRepository: InMemoryItemRepository;
  let useCase: ShipmentUseCase;

  beforeEach(async () => {
    orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();
    itemRepository = new InMemoryItemRepository();
    useCase = new ShipmentUseCase(orderRepository, productRepository, itemRepository);

    // テストデータ
    await itemRepository.save(
      new Item({
        itemId: new ItemId(1),
        name: new ItemName('赤バラ'),
        qualityRetentionDays: new Days(7),
        purchaseUnit: new PurchaseUnit(100),
        leadTimeDays: new Days(3),
        supplierId: new SupplierId(10),
      }),
    );
    await itemRepository.save(
      new Item({
        itemId: new ItemId(2),
        name: new ItemName('カスミソウ'),
        qualityRetentionDays: new Days(14),
        purchaseUnit: new PurchaseUnit(200),
        leadTimeDays: new Days(1),
        supplierId: new SupplierId(10),
      }),
    );

    await productRepository.save(
      new Product({
        productId: new ProductId(1),
        name: new ProductName('ローズブーケ'),
        price: new Price(5500),
        compositions: [
          new ProductComposition(new ItemId(1), new Quantity(5)),
          new ProductComposition(new ItemId(2), new Quantity(3)),
        ],
      }),
    );
  });

  it('出荷日の受注一覧と花材構成を取得できる', async () => {
    // 届け日 4/1 → 出荷日 3/31
    await orderRepository.save(
      new Order({
        orderId: new OrderId(1),
        customerId: new CustomerId(1),
        productId: new ProductId(1),
        price: new Price(5500),
        destination: new DestinationSnapshot('山田花子', '東京都渋谷区', '03-1234-5678'),
        deliveryDate: new DeliveryDate(new Date('2026-04-01'), { skipValidation: true }),
        message: new Message('お誕生日おめでとう'),
        status: new OrderStatus('注文済み'),
      }),
    );

    const result = await useCase.getShipmentTargets(new Date('2026-03-31'));

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].productName).toBe('ローズブーケ');
    expect(result.targets[0].materials).toEqual([
      { itemId: 1, itemName: '赤バラ', quantity: 5 },
      { itemId: 2, itemName: 'カスミソウ', quantity: 3 },
    ]);
    expect(result.totalMaterials).toHaveLength(2);
  });

  it('該当日に受注がない場合は空の結果', async () => {
    const result = await useCase.getShipmentTargets(new Date('2026-04-10'));

    expect(result.targets).toHaveLength(0);
    expect(result.totalMaterials).toHaveLength(0);
  });
});
