import { describe, it, expect } from 'vitest';
import { StockForecastService } from './stock-forecast-service.js';
import { ItemId, Quantity, StockStatus, StockId, OrderId } from '../shared/value-objects.js';
import { StockLot } from '../stock/stock-lot.js';

describe('StockForecastService', () => {
  const itemId = new ItemId(1);
  const fromDate = new Date('2026-04-07');
  const toDate = new Date('2026-04-11');

  const createStockLot = (overrides: {
    quantity: number;
    arrivalDate: string;
    expiryDate: string;
    status?: string;
    orderId?: number;
  }): StockLot =>
    new StockLot({
      stockId: new StockId(1),
      itemId,
      quantity: new Quantity(overrides.quantity),
      arrivalDate: new Date(overrides.arrivalDate),
      expiryDate: new Date(overrides.expiryDate),
      status: new StockStatus((overrides.status ?? '有効') as '有効' | '引当済み' | '消費済み' | '期限切れ'),
      orderId: overrides.orderId ? new OrderId(overrides.orderId) : null,
    });

  describe('Step 1: 現在庫のみで在庫予定数を算出', () => {
    it('有効な在庫ロットの合計が現在庫として算出される', () => {
      const stockLots = [
        createStockLot({ quantity: 30, arrivalDate: '2026-04-01', expiryDate: '2026-04-15' }),
        createStockLot({ quantity: 20, arrivalDate: '2026-04-02', expiryDate: '2026-04-16' }),
      ];

      const forecasts = StockForecastService.calculateForecast(
        itemId, fromDate, toDate, stockLots, [], [],
      );

      expect(forecasts).toHaveLength(5); // 4/7 ~ 4/11
      expect(forecasts[0].currentStock).toBe(50);
      expect(forecasts[0].availableStock).toBe(50);
    });

    it('引当済み・消費済み・期限切れの在庫は現在庫に含まれない', () => {
      const stockLots = [
        createStockLot({ quantity: 30, arrivalDate: '2026-04-01', expiryDate: '2026-04-15' }),
        createStockLot({ quantity: 10, arrivalDate: '2026-04-01', expiryDate: '2026-04-10', status: '引当済み', orderId: 1 }),
        createStockLot({ quantity: 5, arrivalDate: '2026-04-01', expiryDate: '2026-04-10', status: '消費済み', orderId: 2 }),
        createStockLot({ quantity: 5, arrivalDate: '2026-04-01', expiryDate: '2026-04-10', status: '期限切れ' }),
      ];

      const forecasts = StockForecastService.calculateForecast(
        itemId, fromDate, toDate, stockLots, [], [],
      );

      expect(forecasts[0].currentStock).toBe(30); // 有効なロットのみ
    });

    it('fromDate = toDate の場合は 1 日分', () => {
      const stockLots = [
        createStockLot({ quantity: 10, arrivalDate: '2026-04-01', expiryDate: '2026-04-15' }),
      ];

      const forecasts = StockForecastService.calculateForecast(
        itemId, fromDate, fromDate, stockLots, [], [],
      );

      expect(forecasts).toHaveLength(1);
      expect(forecasts[0].availableStock).toBe(10);
    });
  });

  describe('Step 2: 入荷予定を加算', () => {
    it('expectedArrivalDate が対象日以前の発注済み PO が入荷予定に加算される', () => {
      const stockLots = [
        createStockLot({ quantity: 10, arrivalDate: '2026-04-01', expiryDate: '2026-04-15' }),
      ];
      const purchaseOrders = [
        { expectedArrivalDate: new Date('2026-04-09'), quantity: 20, status: '発注済み' },
      ];

      const forecasts = StockForecastService.calculateForecast(
        itemId, fromDate, toDate, stockLots, purchaseOrders, [],
      );

      // 4/7, 4/8: 入荷前 → expectedArrival = 0
      expect(forecasts[0].expectedArrival).toBe(0);
      expect(forecasts[1].expectedArrival).toBe(0);
      // 4/9 以降: 入荷後 → expectedArrival = 20
      expect(forecasts[2].expectedArrival).toBe(20);
      expect(forecasts[2].availableStock).toBe(30); // 10 + 20
    });

    it('入荷済みの PO は入荷予定に含まれない', () => {
      const stockLots = [
        createStockLot({ quantity: 10, arrivalDate: '2026-04-01', expiryDate: '2026-04-15' }),
      ];
      const purchaseOrders = [
        { expectedArrivalDate: new Date('2026-04-09'), quantity: 20, status: '入荷済み' },
      ];

      const forecasts = StockForecastService.calculateForecast(
        itemId, fromDate, toDate, stockLots, purchaseOrders, [],
      );

      expect(forecasts[2].expectedArrival).toBe(0);
    });
  });

  describe('Step 3: 受注引当を減算', () => {
    it('shippingDate が対象日以前の注文が引当として減算される', () => {
      const stockLots = [
        createStockLot({ quantity: 50, arrivalDate: '2026-04-01', expiryDate: '2026-04-15' }),
      ];
      const orders = [
        { shippingDate: new Date('2026-04-09'), totalQuantity: 15 },
      ];

      const forecasts = StockForecastService.calculateForecast(
        itemId, fromDate, toDate, stockLots, [], orders,
      );

      // 4/7, 4/8: 出荷前 → allocated = 0
      expect(forecasts[0].allocated).toBe(0);
      expect(forecasts[1].allocated).toBe(0);
      // 4/9 以降: 出荷後 → allocated = 15
      expect(forecasts[2].allocated).toBe(15);
      expect(forecasts[2].availableStock).toBe(35); // 50 - 15
    });
  });

  describe('Step 4: 品質維持日数超過を減算', () => {
    it('expiryDate が対象日以前の有効在庫が期限超過として減算される', () => {
      const stockLots = [
        createStockLot({ quantity: 30, arrivalDate: '2026-04-01', expiryDate: '2026-04-09' }),
        createStockLot({ quantity: 20, arrivalDate: '2026-04-01', expiryDate: '2026-04-15' }),
      ];

      const forecasts = StockForecastService.calculateForecast(
        itemId, fromDate, toDate, stockLots, [], [],
      );

      // 4/7, 4/8: まだ期限前 → expired = 0
      expect(forecasts[0].expired).toBe(0);
      expect(forecasts[0].currentStock).toBe(50);
      // 4/9: expiryDate = 4/9 → 期限超過
      expect(forecasts[2].expired).toBe(30);
      expect(forecasts[2].availableStock).toBe(20); // 50 - 30
      expect(forecasts[2].isExpiryWarning).toBe(true);
    });
  });

  describe('統合シナリオ', () => {
    it('全要素ありの統合テスト', () => {
      const stockLots = [
        createStockLot({ quantity: 50, arrivalDate: '2026-04-01', expiryDate: '2026-04-10' }),
      ];
      const purchaseOrders = [
        { expectedArrivalDate: new Date('2026-04-09'), quantity: 20, status: '発注済み' },
      ];
      const orders = [
        { shippingDate: new Date('2026-04-08'), totalQuantity: 15 },
      ];

      const forecasts = StockForecastService.calculateForecast(
        itemId, fromDate, toDate, stockLots, purchaseOrders, orders,
      );

      // 4/7: 現在庫50 + 入荷0 - 引当0 - 期限超過0 = 50
      expect(forecasts[0].availableStock).toBe(50);
      // 4/8: 現在庫50 + 入荷0 - 引当15 - 期限超過0 = 35
      expect(forecasts[1].availableStock).toBe(35);
      // 4/9: 現在庫50 + 入荷20 - 引当15 - 期限超過0 = 55
      expect(forecasts[2].availableStock).toBe(55);
      // 4/10: 現在庫50 + 入荷20 - 引当15 - 期限超過50 = 5
      expect(forecasts[3].availableStock).toBe(5);
      expect(forecasts[3].isExpiryWarning).toBe(true);
    });
  });
});
