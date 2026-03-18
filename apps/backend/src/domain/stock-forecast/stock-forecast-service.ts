import { ItemId } from '../shared/value-objects.js';
import { StockForecast } from './stock-forecast.js';

export interface StockLotData {
  itemId: number;
  quantity: number;
  arrivalDate: Date;
  expiryDate: Date;
  status: string;
  orderId: number | null;
}

export interface PurchaseOrderData {
  itemId: number;
  quantity: number;
  expectedArrivalDate: Date;
  status: string;
}

export interface OrderData {
  orderId: number;
  shippingDate: Date;
  status: string;
  compositions: { itemId: number; quantity: number }[];
}

export class StockForecastService {
  calculateForecast(
    itemId: ItemId,
    fromDate: Date,
    toDate: Date,
    stockLots: StockLotData[],
    purchaseOrders: PurchaseOrderData[],
    orders: OrderData[],
  ): StockForecast[] {
    const forecasts: StockForecast[] = [];
    const dates = this.generateDateRange(fromDate, toDate);
    const currentStock = stockLots
      .filter((stockLot) => stockLot.itemId === itemId.value && stockLot.status === '有効')
      .reduce((sum, stockLot) => sum + stockLot.quantity, 0);
    const itemStocks = stockLots.filter((stockLot) => stockLot.itemId === itemId.value && stockLot.status === '有効');
    const itemPurchaseOrders = purchaseOrders.filter(
      (purchaseOrder) => purchaseOrder.itemId === itemId.value && purchaseOrder.status === '発注済み',
    );
    const itemOrders = orders
      .filter((order) => order.status === '注文済み' || order.status === '出荷準備中')
      .map((order) => ({
        shippingDate: order.shippingDate,
        quantity: order.compositions
          .filter((composition) => composition.itemId === itemId.value)
          .reduce((sum, composition) => sum + composition.quantity, 0),
      }))
      .filter((order) => order.quantity > 0);

    for (const date of dates) {
      const expectedArrival = itemPurchaseOrders
        .filter((purchaseOrder) => this.normalizeDate(purchaseOrder.expectedArrivalDate) <= date)
        .reduce((sum, purchaseOrder) => sum + purchaseOrder.quantity, 0);
      const allocated = itemOrders
        .filter((order) => this.normalizeDate(order.shippingDate) <= date)
        .reduce((sum, order) => sum + order.quantity, 0);
      const expired = itemStocks
        .filter((stockLot) => this.normalizeDate(stockLot.expiryDate) <= date)
        .reduce((sum, stockLot) => sum + stockLot.quantity, 0);

      forecasts.push(
        new StockForecast({
          date,
          itemId,
          currentStock,
          expectedArrival,
          allocated,
          expired,
        }),
      );
    }

    return forecasts;
  }

  private generateDateRange(from: Date, to: Date): Date[] {
    const dates: Date[] = [];
    const current = this.normalizeDate(from);
    const end = this.normalizeDate(to);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
}
