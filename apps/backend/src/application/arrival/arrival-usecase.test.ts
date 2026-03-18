import { describe, it, expect, beforeEach } from 'vitest';
import { ArrivalUseCase } from './arrival-usecase.js';
import { InMemoryArrivalRepository } from './in-memory-arrival-repository.js';
import { InMemoryPurchaseOrderRepository } from '../purchase-order/in-memory-purchase-order-repository.js';
import { InMemoryStockLotRepository } from '../stock/in-memory-stock-lot-repository.js';
import { InMemoryItemRepository } from '../item/in-memory-item-repository.js';
import { Item } from '../../domain/item/item.js';
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import {
  Days,
  ItemId,
  ItemName,
  PurchaseOrderId,
  PurchaseOrderStatus,
  PurchaseUnit,
  Quantity,
  SupplierId,
} from '../../domain/shared/value-objects.js';

describe('ArrivalUseCase', () => {
  let arrivalRepository: InMemoryArrivalRepository;
  let purchaseOrderRepository: InMemoryPurchaseOrderRepository;
  let stockLotRepository: InMemoryStockLotRepository;
  let itemRepository: InMemoryItemRepository;
  let useCase: ArrivalUseCase;

  const createItem = () =>
    new Item({
      itemId: new ItemId(1),
      name: new ItemName('赤バラ'),
      qualityRetentionDays: new Days(7),
      purchaseUnit: new PurchaseUnit(100),
      leadTimeDays: new Days(3),
      supplierId: new SupplierId(10),
    });

  const createPurchaseOrder = (overrides?: Partial<{
    purchaseOrderId: PurchaseOrderId;
    status: PurchaseOrderStatus;
    quantity: Quantity;
  }>) =>
    new PurchaseOrder({
      purchaseOrderId: overrides?.purchaseOrderId ?? new PurchaseOrderId(1),
      itemId: new ItemId(1),
      supplierId: new SupplierId(10),
      quantity: overrides?.quantity ?? new Quantity(100),
      orderDate: new Date('2026-03-15'),
      expectedArrivalDate: new Date('2026-03-18'),
      status: overrides?.status ?? new PurchaseOrderStatus('発注済み'),
    });

  beforeEach(() => {
    arrivalRepository = new InMemoryArrivalRepository();
    purchaseOrderRepository = new InMemoryPurchaseOrderRepository();
    stockLotRepository = new InMemoryStockLotRepository();
    itemRepository = new InMemoryItemRepository();
    useCase = new ArrivalUseCase(
      arrivalRepository,
      purchaseOrderRepository,
      stockLotRepository,
      itemRepository,
    );
  });

  it('入荷登録で Arrival 作成 + PurchaseOrder 入荷済み + StockLot 作成される', async () => {
    const item = createItem();
    await itemRepository.save(item);
    const po = createPurchaseOrder();
    await purchaseOrderRepository.save(po);

    const result = await useCase.registerArrival({
      purchaseOrderId: 1,
      quantity: 100,
      arrivalDate: new Date('2026-03-18'),
    });

    expect(result.arrivalId).toBeDefined();
    expect(result.quantity).toBe(100);
    expect(result.status).toBe('入荷済み');

    // PurchaseOrder が入荷済みに更新されている
    const updatedPO = await purchaseOrderRepository.findById(new PurchaseOrderId(1));
    expect(updatedPO!.status.value).toBe('入荷済み');
  });

  it('StockLot が正しい expiryDate で作成される', async () => {
    const item = createItem(); // qualityRetentionDays = 7
    await itemRepository.save(item);
    const po = createPurchaseOrder();
    await purchaseOrderRepository.save(po);

    await useCase.registerArrival({
      purchaseOrderId: 1,
      quantity: 100,
      arrivalDate: new Date('2026-03-18'),
    });

    const stockLots = await stockLotRepository.findActiveByItemId(new ItemId(1));
    expect(stockLots).toHaveLength(1);
    expect(stockLots[0].arrivalDate).toEqual(new Date('2026-03-18'));
    expect(stockLots[0].expiryDate).toEqual(new Date('2026-03-25')); // +7日
    expect(stockLots[0].quantity.value).toBe(100);
    expect(stockLots[0].status.value).toBe('有効');
  });

  it('存在しない PurchaseOrder はエラー', async () => {
    await expect(
      useCase.registerArrival({
        purchaseOrderId: 999,
        quantity: 100,
        arrivalDate: new Date('2026-03-18'),
      }),
    ).rejects.toThrow('発注が見つかりません');
  });

  it('入荷済みの PurchaseOrder への二重入荷はエラー', async () => {
    const item = createItem();
    await itemRepository.save(item);
    const po = createPurchaseOrder({ status: new PurchaseOrderStatus('入荷済み') });
    await purchaseOrderRepository.save(po);

    await expect(
      useCase.registerArrival({
        purchaseOrderId: 1,
        quantity: 100,
        arrivalDate: new Date('2026-03-18'),
      }),
    ).rejects.toThrow('既に入荷済みです');
  });

  it('入荷数量が発注数量と異なる場合はエラー', async () => {
    const item = createItem();
    await itemRepository.save(item);
    const po = createPurchaseOrder();
    await purchaseOrderRepository.save(po);

    await expect(
      useCase.registerArrival({
        purchaseOrderId: 1,
        quantity: 50,
        arrivalDate: new Date('2026-03-18'),
      }),
    ).rejects.toThrow('入荷数量は発注数量と一致する必要があります');
  });

  it('存在しない単品の場合はエラー', async () => {
    // Item を登録せずに PurchaseOrder だけ登録
    const po = createPurchaseOrder();
    await purchaseOrderRepository.save(po);

    await expect(
      useCase.registerArrival({
        purchaseOrderId: 1,
        quantity: 100,
        arrivalDate: new Date('2026-03-18'),
      }),
    ).rejects.toThrow('単品が見つかりません');
  });
});
