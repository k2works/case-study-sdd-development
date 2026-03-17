import { ItemId } from '../../domain/shared/value-objects.js';
import { StockLotRepository } from '../../domain/stock/stock-lot-repository.js';
import { PurchaseOrderRepository } from '../../domain/purchase-order/purchase-order-repository.js';
import { OrderRepository } from '../../domain/order/order-repository.js';
import { StockForecastService, PurchaseOrderForForecast, OrderForForecast } from '../../domain/stock-forecast/stock-forecast-service.js';
import { StockForecast } from '../../domain/stock-forecast/stock-forecast.js';

export interface StockForecastInput {
  itemId: number;
  fromDate: string;
  toDate: string;
}

export interface StockForecastDto {
  date: string;
  itemId: number;
  currentStock: number;
  expectedArrival: number;
  allocated: number;
  expired: number;
  availableStock: number;
  isShortage: boolean;
  isExpiryWarning: boolean;
}

export class StockForecastUseCase {
  constructor(
    private readonly stockLotRepository: StockLotRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: StockForecastInput): Promise<StockForecastDto[]> {
    const itemId = new ItemId(input.itemId);
    const fromDate = new Date(input.fromDate);
    const toDate = new Date(input.toDate);

    // 1. 在庫ロット取得
    const stockLots = await this.stockLotRepository.findByItemId(itemId);

    // 2. 発注取得
    const purchaseOrders = await this.purchaseOrderRepository.findByItemId(itemId);
    const poForForecast: PurchaseOrderForForecast[] = purchaseOrders.map(po => ({
      expectedArrivalDate: po.expectedArrivalDate,
      quantity: po.quantity.value,
      status: po.status.value,
    }));

    // 3. 受注引当（引当済み在庫ロットから、紐づく受注の出荷日を取得）
    const allocatedLots = stockLots.filter(lot => lot.status.value === '引当済み' && lot.orderId);
    const ordersForForecast: OrderForForecast[] = [];

    for (const lot of allocatedLots) {
      const order = await this.orderRepository.findById(lot.orderId!);
      if (order) {
        ordersForForecast.push({
          shippingDate: order.shippingDate.value,
          totalQuantity: lot.quantity.value,
        });
      }
    }

    // 4. ドメインサービスで算出
    const forecasts = StockForecastService.calculateForecast(
      itemId, fromDate, toDate, stockLots, poForForecast, ordersForForecast,
    );

    return forecasts.map(this.toDto);
  }

  private toDto(forecast: StockForecast): StockForecastDto {
    return {
      date: forecast.date.toISOString().split('T')[0],
      itemId: forecast.itemId.value,
      currentStock: forecast.currentStock,
      expectedArrival: forecast.expectedArrival,
      allocated: forecast.allocated,
      expired: forecast.expired,
      availableStock: forecast.availableStock,
      isShortage: forecast.isShortage,
      isExpiryWarning: forecast.isExpiryWarning,
    };
  }
}
