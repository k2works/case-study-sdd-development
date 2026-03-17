import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import { PurchaseOrderRepository } from '../../domain/purchase-order/purchase-order-repository.js';
import { ItemRepository } from '../../domain/item/item-repository.js';
import { ItemId, PurchaseUnit, Days, SupplierId } from '../../domain/shared/value-objects.js';

export interface CreatePurchaseOrderInput {
  itemId: number;
  quantity: number;
}

export interface PurchaseOrderDto {
  id: number;
  itemId: number;
  supplierId: number;
  quantity: number;
  orderDate: string;
  expectedArrivalDate: string;
  status: string;
}

export class PurchaseOrderUseCase {
  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly itemRepository: ItemRepository,
  ) {}

  async createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrderDto> {
    const item = await this.itemRepository.findById(new ItemId(input.itemId));
    if (!item) {
      throw new Error('単品が見つかりません');
    }

    const po = PurchaseOrder.createNew({
      itemId: item.itemId as ItemId,
      supplierId: item.supplierId,
      requestedQuantity: input.quantity,
      purchaseUnit: item.purchaseUnit,
      leadTimeDays: item.leadTimeDays,
      orderDate: new Date(),
    });

    const saved = await this.purchaseOrderRepository.save(po);
    return this.toDto(saved);
  }

  private toDto(po: PurchaseOrder): PurchaseOrderDto {
    return {
      id: po.purchaseOrderId!.value,
      itemId: po.itemId.value,
      supplierId: po.supplierId.value,
      quantity: po.quantity.value,
      orderDate: po.orderDate.toISOString().split('T')[0],
      expectedArrivalDate: po.expectedArrivalDate.toISOString().split('T')[0],
      status: po.status.value,
    };
  }
}
