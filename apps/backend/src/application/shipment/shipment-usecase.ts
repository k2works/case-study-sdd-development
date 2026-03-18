import { ItemRepository } from '../../domain/item/item-repository.js';
import { OrderRepository } from '../../domain/order/order-repository.js';
import { ProductRepository } from '../../domain/product/product-repository.js';
import { StockLotRepository } from '../../domain/stock/stock-lot-repository.js';
import { ShipmentService, ShipmentResult } from '../../domain/shipment/shipment-service.js';
import { OrderId, ProductId } from '../../domain/shared/value-objects.js';

export class ShipmentUseCase {
  private readonly shipmentService = new ShipmentService();

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly itemRepository: ItemRepository,
    private readonly stockLotRepository: StockLotRepository,
  ) {}

  async getShipmentTargets(shippingDate: Date): Promise<ShipmentResult> {
    const orders = await this.orderRepository.findByShippingDate(shippingDate);

    if (orders.length === 0) {
      return { targets: [], totalMaterials: [] };
    }

    // 受注に含まれる商品を取得
    const productIds = [...new Set(orders.map((o) => o.productId.value))];
    const products = await Promise.all(
      productIds.map((id) => this.productRepository.findById(new ProductId(id))),
    );
    const validProducts = products.filter((p) => p !== null);

    // 全単品情報を取得
    const allItems = await this.itemRepository.findAll();
    const itemInfos = allItems.map((i) => ({
      itemId: i.itemId!.value,
      itemName: i.name.value,
    }));

    return this.shipmentService.buildShipmentTargets(orders, validProducts, itemInfos);
  }

  async recordShipment(orderId: number): Promise<void> {
    const order = await this.orderRepository.findById(new OrderId(orderId));
    if (!order) {
      throw new Error('受注が見つかりません');
    }

    // 注文済み→出荷準備中→出荷済みの2段階遷移
    const prepared = order.prepareShipment();
    const shipped = prepared.ship();
    await this.orderRepository.save(shipped);

    // 引当済みロットを消費済みに更新
    const allocatedLots = await this.stockLotRepository.findByOrderId(order.orderId!);
    const consumedLots = allocatedLots.map((lot) => lot.consume());
    if (consumedLots.length > 0) {
      await this.stockLotRepository.saveAll(consumedLots);
    }
  }
}
