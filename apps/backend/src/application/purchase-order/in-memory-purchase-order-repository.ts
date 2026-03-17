import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import { PurchaseOrderRepository } from '../../domain/purchase-order/purchase-order-repository.js';
import { PurchaseOrderId, ItemId } from '../../domain/shared/value-objects.js';

export class InMemoryPurchaseOrderRepository implements PurchaseOrderRepository {
  private readonly purchaseOrders: Map<number, PurchaseOrder> = new Map();
  private nextId = 1;

  clear(): void {
    this.purchaseOrders.clear();
    this.nextId = 1;
  }

  async findById(id: PurchaseOrderId): Promise<PurchaseOrder | null> {
    return this.purchaseOrders.get(id.value) ?? null;
  }

  async findByItemId(itemId: ItemId): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values()).filter(
      (po) => po.itemId.value === itemId.value,
    );
  }

  async save(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> {
    if (!purchaseOrder.purchaseOrderId) {
      const id = this.nextId++;
      const saved = new PurchaseOrder({
        ...purchaseOrder,
        purchaseOrderId: new PurchaseOrderId(id),
      });
      this.purchaseOrders.set(id, saved);
      return saved;
    }
    this.purchaseOrders.set(purchaseOrder.purchaseOrderId.value, purchaseOrder);
    return purchaseOrder;
  }
}
