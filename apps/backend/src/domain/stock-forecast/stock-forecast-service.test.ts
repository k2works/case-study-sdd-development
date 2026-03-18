import { describe, it, expect } from 'vitest';
import { ItemId } from '../shared/value-objects.js';
import { StockForecastService, type OrderData, type PurchaseOrderData, type StockLotData } from './stock-forecast-service.js';

describe('StockForecastService', () => {
  const service = new StockForecastService();
  const targetItemId = new ItemId(1);
  const otherItemId = 2;

  const calculateSingleDayForecast = ({
    fromDate = new Date('2026-03-18'),
    toDate = fromDate,
    stockLots = [],
    purchaseOrders = [],
    orders = [],
  }: {
    fromDate?: Date;
    toDate?: Date;
    stockLots?: StockLotData[];
    purchaseOrders?: PurchaseOrderData[];
    orders?: OrderData[];
  }) => {
    const forecasts = service.calculateForecast(targetItemId, fromDate, toDate, stockLots, purchaseOrders, orders);

    expect(forecasts).toHaveLength(Math.floor((normalizeDate(toDate).getTime() - normalizeDate(fromDate).getTime()) / (24 * 60 * 60 * 1000)) + 1);

    return forecasts[0];
  };

  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  it('全要素ありの在庫推移を計算できる', () => {
    const forecast = calculateSingleDayForecast({
      stockLots: [
        createStockLot({ quantity: 45, expiryDate: new Date('2026-03-20') }),
        createStockLot({ quantity: 5, expiryDate: new Date('2026-03-18') }),
        createStockLot({ itemId: otherItemId, quantity: 999 }),
      ],
      purchaseOrders: [
        createPurchaseOrder({ quantity: 20, expectedArrivalDate: new Date('2026-03-18') }),
        createPurchaseOrder({ itemId: otherItemId, quantity: 999 }),
      ],
      orders: [
        createOrder({ quantity: 15, shippingDate: new Date('2026-03-18') }),
        createOrder({ itemId: otherItemId, quantity: 999 }),
      ],
    });

    expectForecast(forecast, {
      availableStock: 50,
      isShortage: false,
      isExpiryWarning: true,
      currentStock: 50,
      expectedArrival: 20,
      allocated: 15,
      expired: 5,
    });
  });

  it('在庫切れ境界では欠品警告になる', () => {
    const forecast = calculateSingleDayForecast({
      stockLots: [createStockLot({ quantity: 10, expiryDate: new Date('2026-03-19') })],
      orders: [createOrder({ quantity: 10, shippingDate: new Date('2026-03-18') })],
    });

    expectForecast(forecast, {
      availableStock: 0,
      isShortage: true,
      isExpiryWarning: false,
      currentStock: 10,
      expectedArrival: 0,
      allocated: 10,
      expired: 0,
    });
  });

  it('過剰引当で負の在庫を計算できる', () => {
    const forecast = calculateSingleDayForecast({
      stockLots: [createStockLot({ quantity: 5, expiryDate: new Date('2026-03-19') })],
      orders: [createOrder({ quantity: 10, shippingDate: new Date('2026-03-18') })],
    });

    expectForecast(forecast, {
      availableStock: -5,
      isShortage: true,
      isExpiryWarning: false,
      currentStock: 5,
      expectedArrival: 0,
      allocated: 10,
      expired: 0,
    });
  });

  it('品質維持期限当日は期限超過として計算する', () => {
    const forecast = calculateSingleDayForecast({
      stockLots: [createStockLot({ quantity: 30, expiryDate: new Date('2026-03-18') })],
    });

    expectForecast(forecast, {
      availableStock: 0,
      isShortage: true,
      isExpiryWarning: true,
      currentStock: 30,
      expectedArrival: 0,
      allocated: 0,
      expired: 30,
    });
  });

  it('入荷と引当が同日でも両方を反映する', () => {
    const forecast = calculateSingleDayForecast({
      stockLots: [createStockLot({ quantity: 10, expiryDate: new Date('2026-03-19') })],
      purchaseOrders: [createPurchaseOrder({ quantity: 20, expectedArrivalDate: new Date('2026-03-18') })],
      orders: [createOrder({ quantity: 20, shippingDate: new Date('2026-03-18') })],
    });

    expectForecast(forecast, {
      availableStock: 10,
      isShortage: false,
      isExpiryWarning: false,
      currentStock: 10,
      expectedArrival: 20,
      allocated: 20,
      expired: 0,
    });
  });

  it('入荷予定も引当もない場合は現在庫を維持する', () => {
    const forecast = calculateSingleDayForecast({
      stockLots: [createStockLot({ quantity: 30, expiryDate: new Date('2026-03-19') })],
    });

    expectForecast(forecast, {
      availableStock: 30,
      isShortage: false,
      isExpiryWarning: false,
      currentStock: 30,
      expectedArrival: 0,
      allocated: 0,
      expired: 0,
    });
  });

  it('fromDate と toDate が同日の 1 日分を計算できる', () => {
    const fromDate = new Date('2026-03-18');
    const forecasts = service.calculateForecast(
      targetItemId,
      fromDate,
      fromDate,
      [createStockLot({ quantity: 10, expiryDate: new Date('2026-03-19') })],
      [],
      [],
    );

    expect(forecasts).toHaveLength(1);
    expect(forecasts[0].date).toEqual(normalizeDate(fromDate));
    expectForecast(forecasts[0], {
      availableStock: 10,
      isShortage: false,
      isExpiryWarning: false,
      currentStock: 10,
      expectedArrival: 0,
      allocated: 0,
      expired: 0,
    });
  });
});

const createStockLot = ({
  itemId = 1,
  quantity,
  arrivalDate = new Date('2026-03-10'),
  expiryDate = new Date('2026-03-25'),
  status = '有効',
  orderId = null,
}: Partial<StockLotData> & Pick<StockLotData, 'quantity'>): StockLotData => ({
  itemId,
  quantity,
  arrivalDate,
  expiryDate,
  status,
  orderId,
});

const createPurchaseOrder = ({
  itemId = 1,
  quantity,
  expectedArrivalDate = new Date('2026-03-25'),
  status = '発注済み',
}: Partial<PurchaseOrderData> & Pick<PurchaseOrderData, 'quantity'>): PurchaseOrderData => ({
  itemId,
  quantity,
  expectedArrivalDate,
  status,
});

const createOrder = ({
  orderId = 1,
  itemId = 1,
  quantity,
  shippingDate = new Date('2026-03-25'),
  status = '注文済み',
}: {
  orderId?: number;
  itemId?: number;
  quantity: number;
  shippingDate?: Date;
  status?: string;
}): OrderData => ({
  orderId,
  shippingDate,
  status,
  compositions: [{ itemId, quantity }],
});

const expectForecast = (
  forecast: {
    availableStock: number;
    isShortage: boolean;
    isExpiryWarning: boolean;
    currentStock: number;
    expectedArrival: number;
    allocated: number;
    expired: number;
  },
  expected: {
    availableStock: number;
    isShortage: boolean;
    isExpiryWarning: boolean;
    currentStock: number;
    expectedArrival: number;
    allocated: number;
    expired: number;
  },
) => {
  expect(forecast.availableStock).toBe(expected.availableStock);
  expect(forecast.isShortage).toBe(expected.isShortage);
  expect(forecast.isExpiryWarning).toBe(expected.isExpiryWarning);
  expect(forecast.currentStock).toBe(expected.currentStock);
  expect(forecast.expectedArrival).toBe(expected.expectedArrival);
  expect(forecast.allocated).toBe(expected.allocated);
  expect(forecast.expired).toBe(expected.expired);
};
