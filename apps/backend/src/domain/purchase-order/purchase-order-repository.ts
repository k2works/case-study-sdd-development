import { ItemId } from '../shared/value-objects.js';
import { PurchaseOrder } from './purchase-order.js';

export interface PurchaseOrderRecord {
  purchaseOrderId: number;
  itemId: number;
  supplierId: number;
  quantity: number;
  orderDate: Date;
  expectedArrivalDate: Date;
  status: string;
}

export interface PurchaseOrderRepository {
  findByStatus(status: string): Promise<PurchaseOrderRecord[]>;
  findByItemIdAndStatus(itemId: ItemId, status: string): Promise<PurchaseOrderRecord[]>;
  save(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder>;
}
