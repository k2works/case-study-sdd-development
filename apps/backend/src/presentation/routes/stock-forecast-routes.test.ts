import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createStockForecastRoutes } from './stock-forecast-routes.js';
import { StockForecastUseCase } from '../../application/stock/stock-forecast-usecase.js';
import { InMemoryStockLotRepository } from '../../application/stock/in-memory-stock-lot-repository.js';
import { InMemoryPurchaseOrderRepository } from '../../application/purchase-order/in-memory-purchase-order-repository.js';
import { InMemoryOrderRepository } from '../../application/order/in-memory-order-repository.js';
import { InMemoryProductRepository } from '../../application/product/in-memory-product-repository.js';
import { InMemoryItemRepository } from '../../application/item/in-memory-item-repository.js';
import { Item } from '../../domain/item/item.js';
import {
  Days,
  ItemName,
  PurchaseUnit,
  SupplierId,
} from '../../domain/shared/value-objects.js';

function createTestApp() {
  const app = express();
  app.use(express.json());

  const stockLotRepo = new InMemoryStockLotRepository();
  const purchaseOrderRepo = new InMemoryPurchaseOrderRepository();
  const orderRepo = new InMemoryOrderRepository();
  const productRepo = new InMemoryProductRepository();
  const itemRepo = new InMemoryItemRepository();

  const useCase = new StockForecastUseCase(
    stockLotRepo,
    purchaseOrderRepo,
    orderRepo,
    productRepo,
    itemRepo,
  );
  app.use('/api', createStockForecastRoutes(useCase));

  return { app, itemRepo };
}

describe('StockForecast API', () => {
  let app: express.Express;
  let itemRepo: InMemoryItemRepository;

  beforeEach(() => {
    ({ app, itemRepo } = createTestApp());
  });

  it('空データでも 200 を返す', async () => {
    const res = await request(app).get('/api/stock/forecast?fromDate=2026-04-07&toDate=2026-04-07');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('fromDate, toDate 未指定で 400 を返す', async () => {
    const res = await request(app).get('/api/stock/forecast');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'fromDate と toDate は必須です' });
  });

  it('レスポンス形式を返す', async () => {
    await itemRepo.save(
      Item.createNew({
        name: new ItemName('赤バラ'),
        qualityRetentionDays: new Days(5),
        purchaseUnit: new PurchaseUnit(10),
        leadTimeDays: new Days(2),
        supplierId: new SupplierId(1),
      }),
    );

    const res = await request(app).get('/api/stock/forecast?fromDate=2026-04-07&toDate=2026-04-07');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        itemId: expect.any(Number),
        itemName: '赤バラ',
        qualityRetentionDays: 5,
        forecasts: [
          {
            date: '2026-04-07',
            currentStock: 0,
            expectedArrival: 0,
            allocated: 0,
            expired: 0,
            availableStock: 0,
            isShortage: true,
            isExpiryWarning: false,
          },
        ],
      },
    ]);
  });
});
