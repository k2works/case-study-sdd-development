import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createCustomerRoutes } from './customer-routes.js';
import { CustomerUseCase } from '../../application/customer/customer-usecase.js';
import { InMemoryCustomerRepository } from '../../application/customer/in-memory-customer-repository.js';
import { OrderUseCase } from '../../application/order/order-usecase.js';
import { InMemoryOrderRepository } from '../../application/order/in-memory-order-repository.js';
import { InMemoryProductRepository } from '../../application/product/in-memory-product-repository.js';
import { InMemoryStockLotRepository } from '../../application/stock/in-memory-stock-lot-repository.js';
import { Product, ProductComposition } from '../../domain/product/product.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { ProductId, ProductName, Price, ItemId, Quantity } from '../../domain/shared/value-objects.js';

describe('Customer API', () => {
  let app: express.Express;
  let orderUseCase: OrderUseCase;
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
        ],
      }),
    );
    await stockLotRepository.save(
      StockLot.createNew({
        itemId: new ItemId(1),
        quantity: new Quantity(100),
        arrivalDate: new Date('2026-03-15'),
        expiryDate: new Date('2026-04-05'),
      }),
    );
  };

  beforeEach(() => {
    const customerRepository = new InMemoryCustomerRepository();
    const customerUseCase = new CustomerUseCase(customerRepository);
    const orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();
    stockLotRepository = new InMemoryStockLotRepository();
    orderUseCase = new OrderUseCase(orderRepository, productRepository, stockLotRepository);
    app = express();
    app.use(express.json());
    app.use('/api', createCustomerRoutes(customerUseCase, orderUseCase));
  });

  describe('POST /api/customers', () => {
    it('得意先を登録できる', async () => {
      const res = await request(app).post('/api/customers').send({
        name: '山田花店',
        phone: '03-1234-5678',
        email: 'yamada@example.com',
      });

      expect(res.status).toBe(201);
      expect(res.body.customerId).toBeGreaterThan(0);
      expect(res.body.name).toBe('山田花店');
      expect(res.body.email).toBe('yamada@example.com');
    });

    it('名前が空の場合 400 を返す', async () => {
      const res = await request(app).post('/api/customers').send({
        name: '',
        phone: '03-1234-5678',
        email: null,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('電話番号がない場合 400 を返す', async () => {
      const res = await request(app).post('/api/customers').send({
        name: '山田花店',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('phone');
    });
  });

  describe('GET /api/customers', () => {
    it('得意先一覧を取得できる', async () => {
      await request(app).post('/api/customers').send({
        name: '山田花店',
        phone: '03-1111-1111',
        email: null,
      });
      await request(app).post('/api/customers').send({
        name: '鈴木花店',
        phone: '03-2222-2222',
        email: null,
      });

      const res = await request(app).get('/api/customers');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('山田花店');
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('得意先を更新できる', async () => {
      const created = await request(app).post('/api/customers').send({
        name: '山田花店',
        phone: '03-1111-1111',
        email: null,
      });

      const res = await request(app)
        .put(`/api/customers/${created.body.customerId}`)
        .send({
          name: '山田フラワー',
          phone: '03-9999-9999',
          email: 'yamada@flower.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('山田フラワー');
      expect(res.body.email).toBe('yamada@flower.com');
    });

    it('存在しない ID で 404 を返す', async () => {
      const res = await request(app).put('/api/customers/999').send({
        name: '存在しない',
        phone: '000',
        email: null,
      });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/customers/:id/destinations', () => {
    it('届け先一覧を取得できる', async () => {
      const created = await request(app).post('/api/customers').send({
        name: '山田花店',
        phone: '03-1111-1111',
        email: null,
      });

      // addDestination は UseCase 経由でテスト済みなので、ここでは空配列を確認
      const res = await request(app).get(
        `/api/customers/${created.body.customerId}/destinations`,
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /api/customers/:id/order-destinations', () => {
    it('過去の注文から届け先を重複排除して取得できる', async () => {
      await setupProductAndStock();

      const customer = await request(app).post('/api/customers').send({
        name: '山田花店',
        phone: '03-1111-1111',
        email: null,
      });
      const customerId = customer.body.customerId;

      // 同じ届け先で2回注文
      await orderUseCase.createOrder({
        customerId,
        productId: 1,
        destinationName: '田中太郎',
        destinationAddress: '東京都渋谷区1-1-1',
        destinationPhone: '03-3333-3333',
        deliveryDate: '2026-04-01',
      });
      await orderUseCase.createOrder({
        customerId,
        productId: 1,
        destinationName: '田中太郎',
        destinationAddress: '東京都渋谷区1-1-1',
        destinationPhone: '03-3333-3333',
        deliveryDate: '2026-04-05',
      });
      // 別の届け先で1回注文
      await orderUseCase.createOrder({
        customerId,
        productId: 1,
        destinationName: '鈴木花子',
        destinationAddress: '大阪府大阪市2-2-2',
        destinationPhone: '06-4444-4444',
        deliveryDate: '2026-04-10',
      });

      const res = await request(app).get(
        `/api/customers/${customerId}/order-destinations`,
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('田中太郎');
      expect(res.body[1].name).toBe('鈴木花子');
    });

    it('注文がない得意先は空配列を返す', async () => {
      const customer = await request(app).post('/api/customers').send({
        name: '新規花店',
        phone: '03-5555-5555',
        email: null,
      });

      const res = await request(app).get(
        `/api/customers/${customer.body.customerId}/order-destinations`,
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });
});
