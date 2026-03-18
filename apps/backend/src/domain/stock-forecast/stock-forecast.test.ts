import { describe, it, expect } from 'vitest';
import { ItemId } from '../shared/value-objects.js';
import { StockForecast } from './stock-forecast.js';

describe('StockForecast', () => {
  const createForecast = (overrides?: Partial<ConstructorParameters<typeof StockForecast>[0]>) =>
    new StockForecast({
      date: new Date('2026-03-18'),
      itemId: new ItemId(1),
      currentStock: 50,
      expectedArrival: 20,
      allocated: 15,
      expired: 5,
      ...overrides,
    });

  it('availableStock を正しく計算できる', () => {
    const forecast = createForecast();

    expect(forecast.availableStock).toBe(50);
  });

  it('availableStock が 0 以下のとき欠品警告になる', () => {
    const forecast = createForecast({
      currentStock: 10,
      expectedArrival: 0,
      allocated: 10,
      expired: 0,
    });

    expect(forecast.availableStock).toBe(0);
    expect(forecast.isShortage).toBe(true);
  });

  it('expired が 0 より大きいとき品質維持超過警告になる', () => {
    const forecast = createForecast({ expired: 1 });

    expect(forecast.isExpiryWarning).toBe(true);
  });

  it('availableStock は負値を許容する', () => {
    const forecast = createForecast({
      currentStock: 5,
      expectedArrival: 0,
      allocated: 10,
      expired: 0,
    });

    expect(forecast.availableStock).toBe(-5);
    expect(forecast.isShortage).toBe(true);
  });
});
