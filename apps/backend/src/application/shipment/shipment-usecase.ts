import { ItemRepository } from '../../domain/item/item-repository.js';
import { OrderRepository } from '../../domain/order/order-repository.js';
import { ProductRepository } from '../../domain/product/product-repository.js';
import { ShipmentService, ShipmentResult } from '../../domain/shipment/shipment-service.js';
import { ProductId } from '../../domain/shared/value-objects.js';

export class ShipmentUseCase {
  private readonly shipmentService = new ShipmentService();

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly itemRepository: ItemRepository,
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
}
