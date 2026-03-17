import { describe, it, expect, beforeEach } from 'vitest';
import { OrderUseCase, CreateOrderInput } from './order-usecase.js';
import { InMemoryOrderRepository } from './in-memory-order-repository.js';
import { InMemoryProductRepository } from '../product/in-memory-product-repository.js';
import { InMemoryStockLotRepository } from '../stock/in-memory-stock-lot-repository.js';
import { Product, ProductComposition } from '../../domain/product/product.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { ProductId, ProductName, Price, ItemId, Quantity, StockStatus } from '../../domain/shared/value-objects.js';

describe('OrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let productRepository: InMemoryProductRepository;
  let stockLotRepository: InMemoryStockLotRepository;
  let useCase: OrderUseCase;

  const setupProductAndStock = async () => {
    // 商品を登録（赤バラ3本 + カスミソウ5本の花束）
    const product = await productRepository.save(
      new Product({
        productId: new ProductId(1),
        name: new ProductName('ローズブーケ'),
        price: new Price(5500),
        compositions: [
          new ProductComposition(new ItemId(1), new Quantity(3)),
          new ProductComposition(new ItemId(2), new Quantity(5)),
        ],
      }),
    );

    // 在庫ロットを登録
    await stockLotRepository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(10),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-04-05'),
      }),
    );
    await stockLotRepository.save(
      StockLot.createNew({
        itemId: new ItemId(2),
        quantity: new Quantity(20),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-04-05'),
      }),
    );

    return product;
  };

  const validInput: CreateOrderInput = {
    customerId: 10,
    productId: 1,
    destinationName: '田中太郎',
    destinationAddress: '東京都渋谷区1-1-1',
    destinationPhone: '03-1234-5678',
    deliveryDate: '2026-04-01',
    message: 'お誕生日おめでとうございます',
  };

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();
    stockLotRepository = new InMemoryStockLotRepository();
    useCase = new OrderUseCase(orderRepository, productRepository, stockLotRepository);
  });

  describe('createOrder', () => {
    it('注文を作成できる', async () => {
      await setupProductAndStock();

      const order = await useCase.createOrder(validInput);

      expect(order.orderId!.value).toBeGreaterThan(0);
      expect(order.customerId.value).toBe(10);
      expect(order.productId.value).toBe(1);
      expect(order.price.value).toBe(5500);
      expect(order.status.value).toBe('注文済み');
      expect(order.destination.name).toBe('田中太郎');
      expect(order.shippingDate.value).toEqual(new Date('2026-03-31'));
    });

    it('注文作成時に在庫が引当される', async () => {
      await setupProductAndStock();

      const order = await useCase.createOrder(validInput);

      // 赤バラ: 10本中3本引当 → 有効7本、引当済み3本
      const roseStocks = await stockLotRepository.findByItemIdAndStatus(
        new ItemId(1),
        new StockStatus('引当済み'),
      );
      expect(roseStocks.length).toBe(1);
      expect(roseStocks[0].quantity.value).toBe(3);
      expect(roseStocks[0].orderId!.value).toBe(order.orderId!.value);
    });

    it('存在しない商品でエラー', async () => {
      await expect(useCase.createOrder(validInput)).rejects.toThrow('商品が見つかりません');
    });

    it('在庫不足でエラー', async () => {
      // 商品を登録するが在庫は登録しない
      await productRepository.save(
        new Product({
          productId: new ProductId(1),
          name: new ProductName('ローズブーケ'),
          price: new Price(5500),
          compositions: [
            new ProductComposition(new ItemId(1), new Quantity(3)),
          ],
        }),
      );

      await expect(useCase.createOrder(validInput)).rejects.toThrow('在庫が不足しています');
    });
  });

  describe('findById', () => {
    it('注文を取得できる', async () => {
      await setupProductAndStock();
      const created = await useCase.createOrder(validInput);

      const found = await useCase.findById(created.orderId!.value);

      expect(found).not.toBeNull();
      expect(found!.orderId!.value).toBe(created.orderId!.value);
    });

    it('存在しない ID は null を返す', async () => {
      const found = await useCase.findById(999);
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('全件取得できる', async () => {
      await setupProductAndStock();
      await useCase.createOrder(validInput);

      const orders = await useCase.findAll();

      expect(orders).toHaveLength(1);
    });

    it('ステータスでフィルタできる', async () => {
      await setupProductAndStock();
      await useCase.createOrder(validInput);

      const ordered = await useCase.findAll('注文済み');
      expect(ordered).toHaveLength(1);

      const shipped = await useCase.findAll('出荷済み');
      expect(shipped).toHaveLength(0);
    });
  });
});
