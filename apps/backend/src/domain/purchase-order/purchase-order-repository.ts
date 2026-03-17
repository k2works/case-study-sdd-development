import { PurchaseOrder } from './purchase-order.js';
import { PurchaseOrderId, ItemId } from '../shared/value-objects.js';

export interface PurchaseOrderRepository {
  findById(id: PurchaseOrderId): Promise<PurchaseOrder | null>;
  findByItemId(itemId: ItemId): Promise<PurchaseOrder[]>;
  save(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder>;
}
