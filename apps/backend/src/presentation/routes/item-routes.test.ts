import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createItemRoutes } from './item-routes.js';
import { ItemUseCase } from '../../application/item/item-usecase.js';
import { InMemoryItemRepository } from '../../application/item/in-memory-item-repository.js';

describe('Item API', () => {
  let app: express.Express;

  beforeEach(() => {
    const repository = new InMemoryItemRepository();
    const useCase = new ItemUseCase(repository);
    app = express();
    app.use(express.json());
    app.use('/api', createItemRoutes(useCase));
  });

  describe('POST /api/items', () => {
    it('単品を登録できる', async () => {
      const res = await request(app).post('/api/items').send({
        name: '赤バラ',
        qualityRetentionDays: 5,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('赤バラ');
      expect(res.body.id).toBeGreaterThan(0);
    });

    it('不正なデータで 400 を返す', async () => {
      const res = await request(app).post('/api/items').send({
        name: '',
        qualityRetentionDays: 5,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/items', () => {
    it('全件取得できる', async () => {
      await request(app).post('/api/items').send({
        name: '赤バラ',
        qualityRetentionDays: 5,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      });

      const res = await request(app).get('/api/items');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('赤バラ');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('単品を更新できる', async () => {
      const created = await request(app).post('/api/items').send({
        name: '赤バラ',
        qualityRetentionDays: 5,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      });

      const res = await request(app).put(`/api/items/${created.body.id}`).send({
        name: '白バラ',
        qualityRetentionDays: 7,
        purchaseUnit: 50,
        leadTimeDays: 4,
        supplierId: 2,
      });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('白バラ');
    });

    it('存在しない ID で 404 を返す', async () => {
      const res = await request(app).put('/api/items/999').send({
        name: '白バラ',
        qualityRetentionDays: 7,
        purchaseUnit: 50,
        leadTimeDays: 4,
        supplierId: 2,
      });

      expect(res.status).toBe(404);
    });
  });
});
