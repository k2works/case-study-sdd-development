import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createStockForecastRoutes } from './stock-forecast-routes.js';
import { StockForecastUseCase } from '../../application/stock/stock-forecast-usecase.js';
import { InMemoryStockLotRepository } from '../../application/stock/in-memory-stock-lot-repository.js';
import { InMemoryPurchaseOrderRepository } from '../../application/purchase-order/in-memory-purchase-order-repository.js';
import { InMemoryOrderRepository } from '../../application/order/in-memory-order-repository.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { ItemId, Quantity } from '../../domain/shared/value-objects.js';

describe('Stock Forecast API', () => {
  let app: express.Express;
  let stockLotRepo: InMemoryStockLotRepository;

  beforeEach(async () => {
    stockLotRepo = new InMemoryStockLotRepository();
    const purchaseOrderRepo = new InMemoryPurchaseOrderRepository();
    const orderRepo = new InMemoryOrderRepository();
    const useCase = new StockForecastUseCase(stockLotRepo, purchaseOrderRepo, orderRepo);

    app = express();
    app.use('/api', createStockForecastRoutes(useCase));

    // テストデータ: 有効在庫 30本
    await stockLotRepo.save(StockLot.createNew({
      itemId: new ItemId(1),
      quantity: new Quantity(30),
      arrivalDate: new Date('2026-04-01'),
      expiryDate: new Date('2026-04-15'),
    }));
  });

  it('GET /api/stock/forecast で在庫推移を取得できる', async () => {
    const res = await request(app)
      .get('/api/stock/forecast')
      .query({ itemId: 1, fromDate: '2026-04-07', toDate: '2026-04-09' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toMatchObject({
      date: '2026-04-07',
      itemId: 1,
      currentStock: 30,
      availableStock: 30,
      isShortage: false,
    });
  });

  it('必須パラメータがない場合は 400 エラー', async () => {
    const res = await request(app)
      .get('/api/stock/forecast')
      .query({ itemId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('必須');
  });

  it('在庫がない単品の場合は欠品を返す', async () => {
    const res = await request(app)
      .get('/api/stock/forecast')
      .query({ itemId: 999, fromDate: '2026-04-07', toDate: '2026-04-07' });

    expect(res.status).toBe(200);
    expect(res.body[0].availableStock).toBe(0);
    expect(res.body[0].isShortage).toBe(true);
  });
});
