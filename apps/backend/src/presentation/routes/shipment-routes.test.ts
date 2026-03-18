import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createShipmentRoutes } from './shipment-routes.js';
import { ShipmentUseCase } from '../../application/shipment/shipment-usecase.js';
import { InMemoryOrderRepository } from '../../application/order/in-memory-order-repository.js';
import { InMemoryProductRepository } from '../../application/product/in-memory-product-repository.js';
import { InMemoryItemRepository } from '../../application/item/in-memory-item-repository.js';
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

describe('shipment-routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    const orderRepository = new InMemoryOrderRepository();
    const productRepository = new InMemoryProductRepository();
    const itemRepository = new InMemoryItemRepository();
    const useCase = new ShipmentUseCase(orderRepository, productRepository, itemRepository);

    app = express();
    app.use(express.json());
    app.use('/api', createShipmentRoutes(useCase));

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

    await productRepository.save(
      new Product({
        productId: new ProductId(1),
        name: new ProductName('ローズブーケ'),
        price: new Price(5500),
        compositions: [new ProductComposition(new ItemId(1), new Quantity(5))],
      }),
    );

    // 届け日 4/1 → 出荷日 3/31
    await orderRepository.save(
      new Order({
        orderId: new OrderId(1),
        customerId: new CustomerId(1),
        productId: new ProductId(1),
        price: new Price(5500),
        destination: new DestinationSnapshot('山田花子', '渋谷区', '03-1234-5678'),
        deliveryDate: new DeliveryDate(new Date('2026-04-01'), { skipValidation: true }),
        message: new Message(''),
        status: new OrderStatus('注文済み'),
      }),
    );
  });

  it('GET /api/shipments?shippingDate= で出荷対象を取得できる', async () => {
    const res = await request(app).get('/api/shipments?shippingDate=2026-03-31');

    expect(res.status).toBe(200);
    expect(res.body.targets).toHaveLength(1);
    expect(res.body.targets[0].productName).toBe('ローズブーケ');
    expect(res.body.totalMaterials).toHaveLength(1);
  });

  it('shippingDate 未指定で 400', async () => {
    const res = await request(app).get('/api/shipments');
    expect(res.status).toBe(400);
  });

  it('該当日に受注がない場合は空の結果', async () => {
    const res = await request(app).get('/api/shipments?shippingDate=2026-04-10');

    expect(res.status).toBe(200);
    expect(res.body.targets).toHaveLength(0);
  });
});
