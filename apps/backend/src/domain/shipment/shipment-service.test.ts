import { describe, it, expect } from 'vitest';
import { ShipmentService } from './shipment-service.js';
import { Order } from '../order/order.js';
import { Product, ProductComposition } from '../product/product.js';
import { DestinationSnapshot } from '../order/destination-snapshot.js';
import {
  CustomerId,
  DeliveryDate,
  ItemId,
  Message,
  OrderId,
  OrderStatus,
  Price,
  ProductId,
  ProductName,
  Quantity,
} from '../shared/value-objects.js';

describe('ShipmentService', () => {
  const service = new ShipmentService();

  const createOrder = (orderId: number, productId: number) =>
    new Order({
      orderId: new OrderId(orderId),
      customerId: new CustomerId(1),
      productId: new ProductId(productId),
      price: new Price(5500),
      destination: new DestinationSnapshot('山田花子', '東京都渋谷区', '03-1234-5678'),
      deliveryDate: new DeliveryDate(new Date('2026-04-01'), { skipValidation: true }),
      message: new Message('テスト'),
      status: new OrderStatus('注文済み'),
    });

  const createProduct = (productId: number, compositions: { itemId: number; quantity: number }[]) =>
    new Product({
      productId: new ProductId(productId),
      name: new ProductName(`商品${productId}`),
      price: new Price(5500),
      compositions: compositions.map(
        (c) => new ProductComposition(new ItemId(c.itemId), new Quantity(c.quantity)),
      ),
    });

  it('受注と商品構成から出荷対象と花材一覧を組み立てる', () => {
    const orders = [createOrder(1, 1)];
    const products = [createProduct(1, [{ itemId: 1, quantity: 5 }, { itemId: 2, quantity: 3 }])];
    const items = [
      { itemId: 1, itemName: '赤バラ' },
      { itemId: 2, itemName: 'カスミソウ' },
    ];

    const result = service.buildShipmentTargets(orders, products, items);

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].orderId).toBe(1);
    expect(result.targets[0].productName).toBe('商品1');
    expect(result.targets[0].materials).toEqual([
      { itemId: 1, itemName: '赤バラ', quantity: 5 },
      { itemId: 2, itemName: 'カスミソウ', quantity: 3 },
    ]);
  });

  it('同一花材が複数商品で使用される場合の数量集計', () => {
    const orders = [createOrder(1, 1), createOrder(2, 2)];
    const products = [
      createProduct(1, [{ itemId: 1, quantity: 5 }, { itemId: 2, quantity: 3 }]),
      createProduct(2, [{ itemId: 1, quantity: 3 }, { itemId: 3, quantity: 2 }]),
    ];
    const items = [
      { itemId: 1, itemName: '赤バラ' },
      { itemId: 2, itemName: 'カスミソウ' },
      { itemId: 3, itemName: '白ユリ' },
    ];

    const result = service.buildShipmentTargets(orders, products, items);

    expect(result.targets).toHaveLength(2);
    // 全体の花材集計
    expect(result.totalMaterials).toEqual([
      { itemId: 1, itemName: '赤バラ', quantity: 8 }, // 5+3
      { itemId: 2, itemName: 'カスミソウ', quantity: 3 },
      { itemId: 3, itemName: '白ユリ', quantity: 2 },
    ]);
  });

  it('受注ゼロ件の場合は空の結果を返す', () => {
    const result = service.buildShipmentTargets([], [], []);

    expect(result.targets).toHaveLength(0);
    expect(result.totalMaterials).toHaveLength(0);
  });

  it('商品に花材構成がない場合も正常に動作する', () => {
    const orders = [createOrder(1, 1)];
    const products = [createProduct(1, [])];

    const result = service.buildShipmentTargets(orders, products, []);

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].materials).toHaveLength(0);
  });
});
