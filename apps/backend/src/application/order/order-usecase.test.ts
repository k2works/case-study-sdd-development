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

    it('在庫不足時に受注が保存されない', async () => {
      // 商品を登録（赤バラ3本 + カスミソウ5本）
      await productRepository.save(
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

      // 赤バラは十分だがカスミソウの在庫がない
      await stockLotRepository.save(
        StockLot.createNew({
          itemId: new ItemId(1),
          quantity: new Quantity(10),
          arrivalDate: new Date('2026-03-15'),
          expiryDate: new Date('2026-04-05'),
        }),
      );

      await expect(useCase.createOrder(validInput)).rejects.toThrow('在庫が不足しています');

      // 受注が保存されていないことを確認
      const orders = await orderRepository.findAll();
      expect(orders).toHaveLength(0);

      // 在庫が引当されていないことを確認
      const roseStocks = await stockLotRepository.findByItemIdAndStatus(
        new ItemId(1),
        new StockStatus('引当済み'),
      );
      expect(roseStocks).toHaveLength(0);
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

  describe('changeDeliveryDate', () => {
    it('届け日を変更できる', async () => {
      await setupProductAndStock();
      const order = await useCase.createOrder(validInput);

      const result = await useCase.changeDeliveryDate(order.orderId!.value, '2026-05-01');

      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order!.deliveryDate).toBe('2026-05-01');
      expect(result.order!.shippingDate).toBe('2026-04-30');
    });

    it('届け日変更時に在庫引当が再計算される', async () => {
      await setupProductAndStock();
      const order = await useCase.createOrder(validInput);

      // 変更前: 赤バラ3本が引当済み
      const beforeAllocated = await stockLotRepository.findByOrderId(order.orderId!);
      expect(beforeAllocated.length).toBeGreaterThan(0);

      const result = await useCase.changeDeliveryDate(order.orderId!.value, '2026-05-01');

      expect(result.success).toBe(true);

      // 変更後: 引当済みロットが存在し、同じ orderId に紐づく
      const afterAllocated = await stockLotRepository.findByOrderId(order.orderId!);
      expect(afterAllocated.length).toBeGreaterThan(0);
      afterAllocated.forEach((lot) => {
        expect(lot.status.value).toBe('引当済み');
        expect(lot.orderId!.value).toBe(order.orderId!.value);
      });
    });

    it('在庫不足で届け日変更不可の場合、既存引当が維持される', async () => {
      // 商品: 赤バラ 5 本必要
      await productRepository.save(
        new Product({
          productId: new ProductId(1),
          name: new ProductName('ローズブーケ'),
          price: new Price(5500),
          compositions: [
            new ProductComposition(new ItemId(1), new Quantity(5)),
          ],
        }),
      );
      // 在庫 8 本（5 本引当 → 有効 3 本。再引当に 5 本必要だが有効 3+5=8 で足りる）
      // → 在庫 6 本にすると、引当 5 本 → 有効 1 本。再引当時: 有効 1+5=6 で足りる
      // → 2 つの注文で在庫を枯渇させる
      await stockLotRepository.save(
        StockLot.createNew({
          itemId: new ItemId(1),
          quantity: new Quantity(6),
          arrivalDate: new Date('2026-03-15'),
          expiryDate: new Date('2026-04-05'),
        }),
      );

      // 注文 1: 5 本引当 → 有効 1 本
      const order1 = await useCase.createOrder({
        ...validInput,
        deliveryDate: '2026-04-01',
      });

      // 注文 2 用に商品を 1 本構成に変更して注文
      await productRepository.save(
        new Product({
          productId: new ProductId(2),
          name: new ProductName('シングルローズ'),
          price: new Price(1000),
          compositions: [
            new ProductComposition(new ItemId(1), new Quantity(1)),
          ],
        }),
      );
      await useCase.createOrder({
        ...validInput,
        productId: 2,
        deliveryDate: '2026-04-01',
      });

      // 商品を 5 本構成に戻す（注文 1 の変更時チェック用）
      // 有効在庫 0 本。注文 1 を deallocate すると 5 本有効に戻るが、
      // チェック先行方式では deallocate 前にチェックする
      // available = 有効 0 + 引当 5（注文1分）= 5 本 → ちょうど足りる

      // さらに 3 つ目の商品で追加注文して在庫を完全枯渇させるのは複雑なので、
      // 代わりに商品構成を大きくしてテスト
      await productRepository.save(
        new Product({
          productId: new ProductId(1),
          name: new ProductName('デラックスローズ'),
          price: new Price(9000),
          compositions: [
            new ProductComposition(new ItemId(1), new Quantity(10)),
          ],
        }),
      );

      // 注文 1 は元々 5 本構成で作成されたが、商品マスタが 10 本構成に変わった
      // 再引当時は商品の最新構成（10 本）を使うため在庫不足になる
      // available = 有効 0 + 引当 5（注文1分）= 5 本 < 必要 10 本
      const result = await useCase.changeDeliveryDate(order1.orderId!.value, '2026-05-01');

      expect(result.success).toBe(false);
      expect(result.reason).toContain('在庫');

      // 既存引当が維持されていることを確認
      const afterAllocated = await stockLotRepository.findByOrderId(order1.orderId!);
      expect(afterAllocated.length).toBeGreaterThan(0);
      afterAllocated.forEach((lot) => {
        expect(lot.status.value).toBe('引当済み');
        expect(lot.orderId!.value).toBe(order1.orderId!.value);
      });
    });

    it('存在しない受注 ID でエラー', async () => {
      const result = await useCase.changeDeliveryDate(999, '2026-05-01');

      expect(result.success).toBe(false);
      expect(result.reason).toContain('見つかりません');
    });

    it('注文済み以外の状態では変更不可', async () => {
      await setupProductAndStock();
      const order = await useCase.createOrder(validInput);
      // 出荷準備中に遷移
      const prepared = order.prepareShipment();
      await orderRepository.save(prepared);

      const result = await useCase.changeDeliveryDate(order.orderId!.value, '2026-05-01');

      expect(result.success).toBe(false);
      expect(result.reason).toContain('注文済み');
    });
  });

  describe('cancelOrder', () => {
    it('注文済みの受注をキャンセルできる', async () => {
      await setupProductAndStock();
      const order = await useCase.createOrder(validInput);

      const result = await useCase.cancelOrder(order.orderId!.value);

      expect(result.success).toBe(true);

      // 受注状態がキャンセルになっている
      const cancelled = await orderRepository.findById(order.orderId!);
      expect(cancelled!.status.value).toBe('キャンセル');
    });

    it('キャンセル時に引当済み在庫が有効在庫に戻される', async () => {
      await setupProductAndStock();
      const order = await useCase.createOrder(validInput);

      // キャンセル前: 引当済みロットが存在
      const beforeAllocated = await stockLotRepository.findByOrderId(order.orderId!);
      expect(beforeAllocated.length).toBeGreaterThan(0);

      await useCase.cancelOrder(order.orderId!.value);

      // キャンセル後: 引当済みロットがなくなる
      const afterAllocated = await stockLotRepository.findByOrderId(order.orderId!);
      expect(afterAllocated).toHaveLength(0);

      // 有効在庫が戻っている（赤バラ: 元10本、引当3本解除→有効10本に復帰）
      const activeRose = await stockLotRepository.findByItemIdAndStatus(
        new ItemId(1),
        new StockStatus('有効'),
      );
      const totalActive = activeRose.reduce((sum, l) => sum + l.quantity.value, 0);
      expect(totalActive).toBe(10);
    });

    it('出荷準備中の受注はキャンセルできない', async () => {
      await setupProductAndStock();
      const order = await useCase.createOrder(validInput);
      const prepared = order.prepareShipment();
      await orderRepository.save(prepared);

      const result = await useCase.cancelOrder(order.orderId!.value);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('注文済みの受注のみキャンセルできます');
    });

    it('出荷済みの受注はキャンセルできない', async () => {
      await setupProductAndStock();
      const order = await useCase.createOrder(validInput);
      const prepared = order.prepareShipment();
      const shipped = prepared.ship();
      await orderRepository.save(shipped);

      const result = await useCase.cancelOrder(order.orderId!.value);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('注文済みの受注のみキャンセルできます');
    });

    it('存在しない受注 ID でエラー', async () => {
      const result = await useCase.cancelOrder(999);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('見つかりません');
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
