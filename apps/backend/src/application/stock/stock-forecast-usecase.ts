import {
  StockForecastService,
  type OrderData,
  type PurchaseOrderData,
  type StockLotData,
} from '../../domain/stock-forecast/stock-forecast-service.js';
import { type StockForecast } from '../../domain/stock-forecast/stock-forecast.js';
import { type StockLotRepository } from '../../domain/stock/stock-lot-repository.js';
import { type PurchaseOrderRepository } from '../../domain/purchase-order/purchase-order-repository.js';
import { type OrderRepository } from '../../domain/order/order-repository.js';
import { type ProductRepository } from '../../domain/product/product-repository.js';
import { type ItemRepository } from '../../domain/item/item-repository.js';
import { ItemId, OrderStatus } from '../../domain/shared/value-objects.js';

export interface StockForecastResult {
  itemId: number;
  itemName: string;
  qualityRetentionDays: number;
  forecasts: StockForecast[];
}

export class StockForecastUseCase {
  private readonly forecastService = new StockForecastService();

  constructor(
    private readonly stockLotRepository: StockLotRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly itemRepository: ItemRepository,
  ) {}

  async getForecast(fromDate: Date, toDate: Date, itemId?: number): Promise<StockForecastResult[]> {
    const items = itemId
      ? [await this.itemRepository.findById(new ItemId(itemId))].filter((item) => item !== null)
      : await this.itemRepository.findAll();

    if (items.length === 0) {
      return [];
    }

    const stockLots = await this.stockLotRepository.findAllActive();
    const purchaseOrders = await this.purchaseOrderRepository.findByStatus('発注済み');
    const activeOrders = await this.orderRepository.findByStatuses([
      new OrderStatus('注文済み'),
      new OrderStatus('出荷準備中'),
    ]);

    const orderDataList: OrderData[] = [];
    for (const order of activeOrders) {
      const product = await this.productRepository.findById(order.productId);
      if (!product) {
        continue;
      }

      orderDataList.push({
        orderId: order.orderId!.value,
        shippingDate: order.shippingDate.value,
        status: order.status.value,
        compositions: product.compositions.map((composition) => ({
          itemId: composition.itemId.value,
          quantity: composition.quantity.value,
        })),
      });
    }

    const stockLotDataList: StockLotData[] = stockLots.map((stockLot) => ({
      itemId: stockLot.itemId.value,
      quantity: stockLot.quantity.value,
      arrivalDate: stockLot.arrivalDate,
      expiryDate: stockLot.expiryDate,
      status: stockLot.status.value,
      orderId: stockLot.orderId?.value ?? null,
    }));

    const purchaseOrderDataList: PurchaseOrderData[] = purchaseOrders.map((purchaseOrder) => ({
      itemId: purchaseOrder.itemId,
      quantity: purchaseOrder.quantity,
      expectedArrivalDate: purchaseOrder.expectedArrivalDate,
      status: purchaseOrder.status,
    }));

    return items.map((item) => ({
      itemId: item.itemId.value,
      itemName: item.name.value,
      qualityRetentionDays: item.qualityRetentionDays.value,
      forecasts: this.forecastService.calculateForecast(
        item.itemId,
        fromDate,
        toDate,
        stockLotDataList,
        purchaseOrderDataList,
        orderDataList,
      ),
    }));
  }
}
