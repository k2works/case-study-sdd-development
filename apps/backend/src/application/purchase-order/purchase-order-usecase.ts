import { ItemRepository } from '../../domain/item/item-repository.js';
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import { PurchaseOrderRepository } from '../../domain/purchase-order/purchase-order-repository.js';
import { ItemId, Quantity } from '../../domain/shared/value-objects.js';

export interface PurchaseOrderResponse {
  purchaseOrderId: number;
  itemId: number;
  supplierId: number;
  quantity: number;
  orderDate: Date;
  expectedArrivalDate: Date;
  status: string;
}

export class PurchaseOrderUseCase {
  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly itemRepository: ItemRepository,
  ) {}

  async createPurchaseOrder(itemId: number, quantity: number): Promise<PurchaseOrderResponse> {
    const item = await this.itemRepository.findById(new ItemId(itemId));
    if (!item) {
      throw new Error('単品が見つかりません');
    }

    const purchaseOrder = PurchaseOrder.createNew({
      itemId: item.itemId,
      quantity: new Quantity(quantity),
      purchaseUnit: item.purchaseUnit,
      leadTimeDays: item.leadTimeDays.value,
      supplierId: item.supplierId,
    });
    const savedPurchaseOrder = await this.purchaseOrderRepository.save(purchaseOrder);

    return {
      purchaseOrderId: savedPurchaseOrder.purchaseOrderId.value,
      itemId: savedPurchaseOrder.itemId.value,
      supplierId: savedPurchaseOrder.supplierId.value,
      quantity: savedPurchaseOrder.quantity.value,
      orderDate: savedPurchaseOrder.orderDate,
      expectedArrivalDate: savedPurchaseOrder.expectedArrivalDate,
      status: savedPurchaseOrder.status.value,
    };
  }
}
