import { describe, it, expect, beforeEach } from 'vitest';
import { StockForecastUseCase } from './stock-forecast-usecase.js';
import { InMemoryStockLotRepository } from './in-memory-stock-lot-repository.js';
import { InMemoryPurchaseOrderRepository } from '../purchase-order/in-memory-purchase-order-repository.js';
import { InMemoryOrderRepository } from '../order/in-memory-order-repository.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import { Order } from '../../domain/order/order.js';
import { DestinationSnapshot } from '../../domain/order/destination-snapshot.js';
import {
  ItemId, Quantity, StockStatus, PurchaseOrderId, PurchaseOrderStatus,
  SupplierId, PurchaseUnit, Days, CustomerId, ProductId, Price,
  DeliveryDate, Message,
} from '../../domain/shared/value-objects.js';

describe('StockForecastUseCase', () => {
  let stockLotRepo: InMemoryStockLotRepository;
  let purchaseOrderRepo: InMemoryPurchaseOrderRepository;
  let orderRepo: InMemoryOrderRepository;
  let useCase: StockForecastUseCase;

  beforeEach(() => {
    stockLotRepo = new InMemoryStockLotRepository();
    purchaseOrderRepo = new InMemoryPurchaseOrderRepository();
    orderRepo = new InMemoryOrderRepository();
    useCase = new StockForecastUseCase(stockLotRepo, purchaseOrderRepo, orderRepo);
  });

  it('在庫ロット・発注・受注を組み合わせて在庫推移を返す', async () => {
    // 有効な在庫ロット 50本、4/10 に期限切れ
    await stockLotRepo.save(StockLot.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(50),
      arrivalDate: new Date('2026-04-01'),
      expiryDate: new Date('2026-04-10'),
    }));

    // 発注済み 20本、4/9 入荷予定
    await purchaseOrderRepo.save(new PurchaseOrder({
      purchaseOrderId: null,
      itemId: new ItemId(1),
      supplierId: new SupplierId(1),
      quantity: new Quantity(20),
      orderDate: new Date('2026-04-05'),
      expectedArrivalDate: new Date('2026-04-09'),
      status: new PurchaseOrderStatus('発注済み'),
    }));

    // 受注 15本、出荷日 4/8
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await orderRepo.save(Order.createNew({
      customerId: new CustomerId(1),
      productId: new ProductId(1),
      price: new Price(5500),
      destination: new DestinationSnapshot('山田', '東京', '03-1234'),
      deliveryDate: new DeliveryDate(futureDate),
      message: new Message(''),
    }));

    const result = await useCase.execute({
      itemId: 1,
      fromDate: '2026-04-07',
      toDate: '2026-04-11',
    });

    expect(result).toHaveLength(5);
    // 各日の currentStock は 50（有効在庫合計）
    expect(result[0].currentStock).toBe(50);
  });

  it('在庫がない場合は全日 0 を返す', async () => {
    const result = await useCase.execute({
      itemId: 1,
      fromDate: '2026-04-07',
      toDate: '2026-04-09',
    });

    expect(result).toHaveLength(3);
    expect(result[0].availableStock).toBe(0);
    expect(result[0].isShortage).toBe(true);
  });
});
