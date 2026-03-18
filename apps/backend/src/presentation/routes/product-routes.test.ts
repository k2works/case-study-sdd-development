import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createProductRoutes } from './product-routes.js';
import { ProductUseCase } from '../../application/product/product-usecase.js';
import { InMemoryProductRepository } from '../../application/product/in-memory-product-repository.js';

describe('Product API', () => {
  let app: express.Express;

  beforeEach(() => {
    const repository = new InMemoryProductRepository();
    const useCase = new ProductUseCase(repository);
    app = express();
    app.use(express.json());
    app.use('/api', createProductRoutes(useCase));
  });

  describe('POST /api/products', () => {
    it('商品を登録できる', async () => {
      const res = await request(app).post('/api/products').send({
        name: 'ローズブーケ',
        price: 5500,
        compositions: [{ itemId: 1, quantity: 5 }],
      });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('ローズブーケ');
      expect(res.body.price).toBe(5500);
      expect(res.body.compositions).toHaveLength(1);
    });

    it('不正なデータで 400 を返す', async () => {
      const res = await request(app).post('/api/products').send({
        name: '',
        price: 5500,
        compositions: [],
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/products', () => {
    it('全件取得できる', async () => {
      await request(app).post('/api/products').send({
        name: 'ローズブーケ',
        price: 5500,
        compositions: [],
      });

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('商品を更新できる', async () => {
      const created = await request(app).post('/api/products').send({
        name: 'ローズブーケ',
        price: 5500,
        compositions: [{ itemId: 1, quantity: 5 }],
      });

      const res = await request(app)
        .put(`/api/products/${created.body.id}`)
        .send({
          name: 'スプリングミックス',
          price: 3800,
          compositions: [{ itemId: 2, quantity: 10 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('スプリングミックス');
      expect(res.body.price).toBe(3800);
    });

    it('存在しない ID で 404 を返す', async () => {
      const res = await request(app).put('/api/products/999').send({
        name: 'テスト',
        price: 1000,
        compositions: [],
      });

      expect(res.status).toBe(404);
    });
  });
});
