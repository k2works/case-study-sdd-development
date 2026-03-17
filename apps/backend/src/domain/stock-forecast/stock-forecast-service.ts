import { ItemId } from '../shared/value-objects.js';
import { StockLot } from '../stock/stock-lot.js';
import { StockForecast } from './stock-forecast.js';

export interface PurchaseOrderForForecast {
  expectedArrivalDate: Date;
  quantity: number;
  status: string;
}

export interface OrderForForecast {
  shippingDate: Date;
  totalQuantity: number;
}

export class StockForecastService {
  static calculateForecast(
    itemId: ItemId,
    fromDate: Date,
    toDate: Date,
    stockLots: StockLot[],
    purchaseOrders: PurchaseOrderForForecast[],
    orders: OrderForForecast[],
  ): StockForecast[] {
    const dates = StockForecastService.generateDateRange(fromDate, toDate);

    // Step 1: 現在庫（有効な在庫ロットのみ）
    const activeStockLots = stockLots.filter(lot => lot.status.value === '有効');
    const currentStock = activeStockLots.reduce((sum, lot) => sum + lot.quantity.value, 0);

    return dates.map(date => {
      // Step 2: 入荷予定（発注済みで expectedArrivalDate <= 対象日）
      const expectedArrival = purchaseOrders
        .filter(po => po.status === '発注済み' && po.expectedArrivalDate <= date)
        .reduce((sum, po) => sum + po.quantity, 0);

      // Step 3: 受注引当（shippingDate <= 対象日）
      const allocated = orders
        .filter(order => order.shippingDate <= date)
        .reduce((sum, order) => sum + order.totalQuantity, 0);

      // Step 4: 品質維持日数超過（expiryDate <= 対象日の有効在庫）
      const expired = activeStockLots
        .filter(lot => lot.expiryDate <= date)
        .reduce((sum, lot) => sum + lot.quantity.value, 0);

      return new StockForecast({
        date,
        itemId,
        currentStock,
        expectedArrival,
        allocated,
        expired,
      });
    });
  }

  private static generateDateRange(fromDate: Date, toDate: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(fromDate);
    while (current <= toDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}
