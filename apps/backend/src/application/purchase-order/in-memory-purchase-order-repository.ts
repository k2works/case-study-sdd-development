import type {
  PurchaseOrderRecord,
  PurchaseOrderRepository,
} from '../../domain/purchase-order/purchase-order-repository.js';
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import {
  ItemId,
  PurchaseOrderId,
  PurchaseOrderStatus,
  Quantity,
  SupplierId,
} from '../../domain/shared/value-objects.js';

export class InMemoryPurchaseOrderRepository implements PurchaseOrderRepository {
  private records: PurchaseOrderRecord[] = [];
  private nextId = 1;

  clear(): void {
    this.records = [];
    this.nextId = 1;
  }

  addRecord(record: PurchaseOrderRecord): void {
    this.records.push(record);
    this.nextId = Math.max(this.nextId, record.purchaseOrderId + 1);
  }

  async findById(id: PurchaseOrderId): Promise<PurchaseOrder | null> {
    const record = this.records.find((r) => r.purchaseOrderId === id.value);
    if (!record) return null;
    return new PurchaseOrder({
      purchaseOrderId: new PurchaseOrderId(record.purchaseOrderId),
      itemId: new ItemId(record.itemId),
      supplierId: new SupplierId(record.supplierId),
      quantity: new Quantity(record.quantity),
      orderDate: record.orderDate,
      expectedArrivalDate: record.expectedArrivalDate,
      status: new PurchaseOrderStatus(record.status as '発注済み' | '入荷済み'),
    });
  }

  async findByStatus(status: string): Promise<PurchaseOrderRecord[]> {
    return this.records.filter((record) => record.status === status);
  }

  async findByItemIdAndStatus(itemId: ItemId, status: string): Promise<PurchaseOrderRecord[]> {
    return this.records.filter((record) => record.itemId === itemId.value && record.status === status);
  }

  async save(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> {
    const purchaseOrderId = purchaseOrder.purchaseOrderId
      ? purchaseOrder.purchaseOrderId
      : new PurchaseOrderId(this.nextId++);
    this.nextId = Math.max(this.nextId, purchaseOrderId.value + 1);
    const savedPurchaseOrder = new PurchaseOrder({
      purchaseOrderId,
      itemId: purchaseOrder.itemId,
      supplierId: purchaseOrder.supplierId,
      quantity: purchaseOrder.quantity,
      orderDate: purchaseOrder.orderDate,
      expectedArrivalDate: purchaseOrder.expectedArrivalDate,
      status: purchaseOrder.status,
    });

    const record = this.toRecord(savedPurchaseOrder);
    this.records = this.records.filter((existing) => existing.purchaseOrderId !== record.purchaseOrderId);
    this.records.push(record);

    return savedPurchaseOrder;
  }

  private toRecord(purchaseOrder: PurchaseOrder): PurchaseOrderRecord {
    return {
      purchaseOrderId: purchaseOrder.purchaseOrderId.value,
      itemId: purchaseOrder.itemId.value,
      supplierId: purchaseOrder.supplierId.value,
      quantity: purchaseOrder.quantity.value,
      orderDate: purchaseOrder.orderDate,
      expectedArrivalDate: purchaseOrder.expectedArrivalDate,
      status: purchaseOrder.status.value,
    };
  }
}
