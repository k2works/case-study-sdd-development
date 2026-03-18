import { beforeEach, describe, expect, it } from 'vitest';
import { StockForecastUseCase } from './stock-forecast-usecase.js';
import { InMemoryStockLotRepository } from './in-memory-stock-lot-repository.js';
import { InMemoryPurchaseOrderRepository } from '../purchase-order/in-memory-purchase-order-repository.js';
import { InMemoryOrderRepository } from '../order/in-memory-order-repository.js';
import { InMemoryProductRepository } from '../product/in-memory-product-repository.js';
import { InMemoryItemRepository } from '../item/in-memory-item-repository.js';
import { Item } from '../../domain/item/item.js';
import { Product, ProductComposition } from '../../domain/product/product.js';
import { Order } from '../../domain/order/order.js';
import { DestinationSnapshot } from '../../domain/order/destination-snapshot.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import {
  CustomerId,
  Days,
  DeliveryDate,
  ItemId,
  ItemName,
  Message,
  OrderStatus,
  Price,
  ProductId,
  ProductName,
  PurchaseUnit,
  Quantity,
  SupplierId,
} from '../../domain/shared/value-objects.js';

describe('StockForecastUseCase', () => {
  let stockLotRepository: InMemoryStockLotRepository;
  let purchaseOrderRepository: InMemoryPurchaseOrderRepository;
  let orderRepository: InMemoryOrderRepository;
  let productRepository: InMemoryProductRepository;
  let itemRepository: InMemoryItemRepository;
  let useCase: StockForecastUseCase;

  beforeEach(() => {
    stockLotRepository = new InMemoryStockLotRepository();
    purchaseOrderRepository = new InMemoryPurchaseOrderRepository();
    orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();
    itemRepository = new InMemoryItemRepository();
    useCase = new StockForecastUseCase(
      stockLotRepository,
      purchaseOrderRepository,
      orderRepository,
      productRepository,
      itemRepository,
    );
  });

  it('単品 1 件の現在庫をそのまま返す', async () => {
    await registerItem({ itemId: 1, name: '赤バラ', qualityRetentionDays: 5 });
    await addActiveStockLot({ itemId: 1, quantity: 10, expiryDate: '2026-03-30' });

    const results = await useCase.getForecast(
      new Date('2026-03-18'),
      new Date('2026-03-18'),
      1,
    );

    expect(results).toHaveLength(1);
    expect(results[0].itemId).toBe(1);
    expect(results[0].itemName).toBe('赤バラ');
    expect(results[0].qualityRetentionDays).toBe(5);
    expect(results[0].forecasts).toHaveLength(1);
    expect(results[0].forecasts[0].currentStock).toBe(10);
    expect(results[0].forecasts[0].expectedArrival).toBe(0);
    expect(results[0].forecasts[0].allocated).toBe(0);
    expect(results[0].forecasts[0].expired).toBe(0);
    expect(results[0].forecasts[0].availableStock).toBe(10);
  });

  it('期間内の入荷予定を加算する', async () => {
    await registerItem({ itemId: 1, name: '赤バラ', qualityRetentionDays: 5 });
    await addActiveStockLot({ itemId: 1, quantity: 10, expiryDate: '2026-03-30' });
    purchaseOrderRepository.addRecord({
      purchaseOrderId: 1,
      itemId: 1,
      supplierId: 1,
      quantity: 15,
      orderDate: new Date('2026-03-15'),
      expectedArrivalDate: new Date('2026-03-19'),
      status: '発注済み',
    });

    const results = await useCase.getForecast(
      new Date('2026-03-18'),
      new Date('2026-03-19'),
      1,
    );

    expect(results[0].forecasts).toHaveLength(2);
    expect(results[0].forecasts[0].expectedArrival).toBe(0);
    expect(results[0].forecasts[1].expectedArrival).toBe(15);
    expect(results[0].forecasts[1].availableStock).toBe(25);
  });

  it('受注の商品構成をもとに引当数を減算する', async () => {
    await registerItem({ itemId: 1, name: '赤バラ', qualityRetentionDays: 5 });
    await registerProduct({
      productId: 1,
      name: 'ローズブーケ',
      compositions: [{ itemId: 1, quantity: 3 }],
    });
    await addActiveStockLot({ itemId: 1, quantity: 10, expiryDate: '2026-03-30' });
    await saveOrder({
      productId: 1,
      deliveryDate: '2026-03-20',
      status: '注文済み',
    });

    const results = await useCase.getForecast(
      new Date('2026-03-18'),
      new Date('2026-03-19'),
      1,
    );

    expect(results[0].forecasts[0].allocated).toBe(0);
    expect(results[0].forecasts[1].allocated).toBe(3);
    expect(results[0].forecasts[1].availableStock).toBe(7);
  });

  it('品質維持期限を超えた在庫を減算する', async () => {
    await registerItem({ itemId: 1, name: '赤バラ', qualityRetentionDays: 5 });
    await addActiveStockLot({ itemId: 1, quantity: 10, expiryDate: '2026-03-19' });

    const results = await useCase.getForecast(
      new Date('2026-03-18'),
      new Date('2026-03-19'),
      1,
    );

    expect(results[0].forecasts[0].expired).toBe(0);
    expect(results[0].forecasts[1].expired).toBe(10);
    expect(results[0].forecasts[1].availableStock).toBe(0);
  });

  it('itemId 未指定時は全単品の推移を返す', async () => {
    await registerItem({ itemId: 1, name: '赤バラ', qualityRetentionDays: 5 });
    await registerItem({ itemId: 2, name: '白ユリ', qualityRetentionDays: 7 });
    await addActiveStockLot({ itemId: 1, quantity: 10, expiryDate: '2026-03-30' });
    await addActiveStockLot({ itemId: 2, quantity: 20, expiryDate: '2026-03-30' });

    const results = await useCase.getForecast(
      new Date('2026-03-18'),
      new Date('2026-03-18'),
    );

    expect(results).toHaveLength(2);
    expect(results.map((result) => result.itemId)).toEqual([1, 2]);
  });

  it('対象単品が存在しない場合は空配列を返す', async () => {
    const results = await useCase.getForecast(
      new Date('2026-03-18'),
      new Date('2026-03-18'),
      999,
    );

    expect(results).toEqual([]);
  });

  const registerItem = async ({
    itemId,
    name,
    qualityRetentionDays,
  }: {
    itemId: number;
    name: string;
    qualityRetentionDays: number;
  }) => {
    await itemRepository.save(
      new Item({
        itemId: new ItemId(itemId),
        name: new ItemName(name),
        qualityRetentionDays: new Days(qualityRetentionDays),
        purchaseUnit: new PurchaseUnit(10),
        leadTimeDays: new Days(2),
        supplierId: new SupplierId(1),
      }),
    );
  };

  const registerProduct = async ({
    productId,
    name,
    compositions,
  }: {
    productId: number;
    name: string;
    compositions: { itemId: number; quantity: number }[];
  }) => {
    await productRepository.save(
      new Product({
        productId: new ProductId(productId),
        name: new ProductName(name),
        price: new Price(5500),
        compositions: compositions.map(
          (composition) =>
            new ProductComposition(
              new ItemId(composition.itemId),
              new Quantity(composition.quantity),
            ),
        ),
      }),
    );
  };

  const addActiveStockLot = async ({
    itemId,
    quantity,
    expiryDate,
  }: {
    itemId: number;
    quantity: number;
    expiryDate: string;
  }) => {
    await stockLotRepository.save(
      StockLot.createNew({
        itemId: new ItemId(itemId),
        quantity: new Quantity(quantity),
        arrivalDate: new Date('2026-03-10'),
        expiryDate: new Date(expiryDate),
      }),
    );
  };

  const saveOrder = async ({
    productId,
    deliveryDate,
    status,
  }: {
    productId: number;
    deliveryDate: string;
    status: '注文済み' | '出荷準備中';
  }) => {
    const baseOrder = await orderRepository.save(
      Order.createNew({
        customerId: new CustomerId(1),
        productId: new ProductId(productId),
        price: new Price(5500),
        destination: new DestinationSnapshot('田中太郎', '東京都渋谷区1-1-1', '03-1234-5678'),
        deliveryDate: new DeliveryDate(new Date(deliveryDate)),
        message: new Message(''),
      }),
    );

    if (status === '注文済み') {
      return baseOrder;
    }

    return orderRepository.save(
      new Order({
        ...baseOrder,
        status: new OrderStatus(status),
      }),
    );
  };
});
