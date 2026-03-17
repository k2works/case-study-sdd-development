import { describe, it, expect } from 'vitest';
import { StockForecast } from './stock-forecast.js';
import { ItemId } from '../shared/value-objects.js';

describe('StockForecast', () => {
  const itemId = new ItemId(1);
  const date = new Date('2026-04-07');

  it('全要素ありで在庫予定数を正しく算出する', () => {
    const forecast = new StockForecast({
      date,
      itemId,
      currentStock: 50,
      expectedArrival: 20,
      allocated: 15,
      expired: 5,
    });

    expect(forecast.availableStock).toBe(50); // 50 + 20 - 15 - 5
    expect(forecast.isShortage).toBe(false);
    expect(forecast.isExpiryWarning).toBe(true); // expired > 0 なので警告
  });

  it('在庫切れ境界（availableStock = 0）で欠品警告', () => {
    const forecast = new StockForecast({
      date,
      itemId,
      currentStock: 10,
      expectedArrival: 0,
      allocated: 10,
      expired: 0,
    });

    expect(forecast.availableStock).toBe(0);
    expect(forecast.isShortage).toBe(true);
  });

  it('負の在庫（過剰引当）で欠品警告', () => {
    const forecast = new StockForecast({
      date,
      itemId,
      currentStock: 5,
      expectedArrival: 0,
      allocated: 10,
      expired: 0,
    });

    expect(forecast.availableStock).toBe(-5);
    expect(forecast.isShortage).toBe(true);
  });

  it('品質維持期限超過で警告フラグ', () => {
    const forecast = new StockForecast({
      date,
      itemId,
      currentStock: 30,
      expectedArrival: 0,
      allocated: 0,
      expired: 30,
    });

    expect(forecast.availableStock).toBe(0);
    expect(forecast.isShortage).toBe(true);
    expect(forecast.isExpiryWarning).toBe(true);
  });

  it('入荷と引当が同日', () => {
    const forecast = new StockForecast({
      date,
      itemId,
      currentStock: 10,
      expectedArrival: 20,
      allocated: 20,
      expired: 0,
    });

    expect(forecast.availableStock).toBe(10);
    expect(forecast.isShortage).toBe(false);
  });

  it('品質維持日数 0 日（全在庫が期限超過）', () => {
    const forecast = new StockForecast({
      date,
      itemId,
      currentStock: 10,
      expectedArrival: 0,
      allocated: 0,
      expired: 10,
    });

    expect(forecast.availableStock).toBe(0);
    expect(forecast.isExpiryWarning).toBe(true);
  });

  it('入荷予定なし・引当なし', () => {
    const forecast = new StockForecast({
      date,
      itemId,
      currentStock: 30,
      expectedArrival: 0,
      allocated: 0,
      expired: 0,
    });

    expect(forecast.availableStock).toBe(30);
    expect(forecast.isShortage).toBe(false);
    expect(forecast.isExpiryWarning).toBe(false);
  });

  it('プロパティを正しく保持する', () => {
    const forecast = new StockForecast({
      date,
      itemId,
      currentStock: 50,
      expectedArrival: 20,
      allocated: 15,
      expired: 5,
    });

    expect(forecast.date).toEqual(date);
    expect(forecast.itemId).toBe(itemId);
    expect(forecast.currentStock).toBe(50);
    expect(forecast.expectedArrival).toBe(20);
    expect(forecast.allocated).toBe(15);
    expect(forecast.expired).toBe(5);
  });
});
