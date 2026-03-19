import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createOrderRoutes } from './order-routes.js';
import { OrderUseCase } from '../../application/order/order-usecase.js';
import { InMemoryOrderRepository } from '../../application/order/in-memory-order-repository.js';
import { InMemoryProductRepository } from '../../application/product/in-memory-product-repository.js';
import { InMemoryStockLotRepository } from '../../application/stock/in-memory-stock-lot-repository.js';
import { Product, ProductComposition } from '../../domain/product/product.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { ProductId, ProductName, Price, ItemId, Quantity } from '../../domain/shared/value-objects.js';

describe('Order API', () => {
  let app: express.Express;
  let productRepository: InMemoryProductRepository;
  let stockLotRepository: InMemoryStockLotRepository;

  const setupProductAndStock = async () => {
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
  };

  beforeEach(() => {
    const orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();
    stockLotRepository = new InMemoryStockLotRepository();
    const useCase = new OrderUseCase(orderRepository, productRepository, stockLotRepository);
    app = express();
    app.use(express.json());
    app.use('/api', createOrderRoutes(useCase));
  });

  describe('POST /api/orders', () => {
    it('注文を登録できる', async () => {
      await setupProductAndStock();

      const res = await request(app).post('/api/orders').send({
        customerId: 10,
        productId: 1,
        destinationName: '田中太郎',
        destinationAddress: '東京都渋谷区1-1-1',
        destinationPhone: '03-1234-5678',
        deliveryDate: '2026-04-01',
        message: 'お誕生日おめでとうございます',
      });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeGreaterThan(0);
      expect(res.body.status).toBe('注文済み');
      expect(res.body.price).toBe(5500);
      expect(res.body.productName).toBe('ローズブーケ');
      expect(res.body.destination.name).toBe('田中太郎');
    });

    it('存在しない商品で 400 を返す', async () => {
      const res = await request(app).post('/api/orders').send({
        customerId: 10,
        productId: 999,
        destinationName: '田中太郎',
        destinationAddress: '東京都',
        destinationPhone: '03-1234-5678',
        deliveryDate: '2026-04-01',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/orders', () => {
    it('全件取得できる', async () => {
      await setupProductAndStock();
      await request(app).post('/api/orders').send({
        customerId: 10,
        productId: 1,
        destinationName: '田中太郎',
        destinationAddress: '東京都',
        destinationPhone: '03-1234-5678',
        deliveryDate: '2026-04-01',
      });

      const res = await request(app).get('/api/orders');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].productName).toBe('ローズブーケ');
    });

    it('ステータスでフィルタできる', async () => {
      await setupProductAndStock();
      await request(app).post('/api/orders').send({
        customerId: 10,
        productId: 1,
        destinationName: '田中太郎',
        destinationAddress: '東京都',
        destinationPhone: '03-1234-5678',
        deliveryDate: '2026-04-01',
      });

      const ordered = await request(app).get('/api/orders?status=注文済み');
      expect(ordered.body).toHaveLength(1);

      const shipped = await request(app).get('/api/orders?status=出荷済み');
      expect(shipped.body).toHaveLength(0);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('注文を取得できる', async () => {
      await setupProductAndStock();
      const created = await request(app).post('/api/orders').send({
        customerId: 10,
        productId: 1,
        destinationName: '田中太郎',
        destinationAddress: '東京都',
        destinationPhone: '03-1234-5678',
        deliveryDate: '2026-04-01',
      });

      const res = await request(app).get(`/api/orders/${created.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.body.id);
      expect(res.body.productName).toBe('ローズブーケ');
      expect(res.body.destination.name).toBe('田中太郎');
    });

    it('存在しない ID で 404 を返す', async () => {
      const res = await request(app).get('/api/orders/999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/orders/:id/delivery-date', () => {
    it('届け日を変更できる', async () => {
      await setupProductAndStock();
      const created = await request(app).post('/api/orders').send({
        customerId: 10,
        productId: 1,
        destinationName: '田中太郎',
        destinationAddress: '東京都',
        destinationPhone: '03-1234-5678',
        deliveryDate: '2026-04-01',
      });

      const res = await request(app)
        .put(`/api/orders/${created.body.id}/delivery-date`)
        .send({ newDeliveryDate: '2026-05-01' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.deliveryDate).toBe('2026-05-01');
      expect(res.body.order.shippingDate).toBe('2026-04-30');
      expect(res.body.order.status).toBe('注文済み');
    });

    it('存在しない受注 ID で失敗レスポンスを返す', async () => {
      const res = await request(app)
        .put('/api/orders/999/delivery-date')
        .send({ newDeliveryDate: '2026-05-01' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.reason).toBeDefined();
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    it('注文をキャンセルできる', async () => {
      await setupProductAndStock();
      const created = await request(app).post('/api/orders').send({
        customerId: 10,
        productId: 1,
        destinationName: '田中太郎',
        destinationAddress: '東京都',
        destinationPhone: '03-1234-5678',
        deliveryDate: '2026-04-01',
      });

      const res = await request(app).put(`/api/orders/${created.body.id}/cancel`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // キャンセル後の状態確認
      const order = await request(app).get(`/api/orders/${created.body.id}`);
      expect(order.body.status).toBe('キャンセル');
    });

    it('存在しない受注 ID で失敗レスポンスを返す', async () => {
      const res = await request(app).put('/api/orders/999/cancel');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.reason).toBeDefined();
    });
  });
});
