import type {
  PurchaseOrderRecord,
  PurchaseOrderRepository,
} from '../../domain/purchase-order/purchase-order-repository.js';
import { ItemId } from '../../domain/shared/value-objects.js';

export class InMemoryPurchaseOrderRepository implements PurchaseOrderRepository {
  private records: PurchaseOrderRecord[] = [];

  clear(): void {
    this.records = [];
  }

  addRecord(record: PurchaseOrderRecord): void {
    this.records.push(record);
  }

  async findByStatus(status: string): Promise<PurchaseOrderRecord[]> {
    return this.records.filter((record) => record.status === status);
  }

  async findByItemIdAndStatus(itemId: ItemId, status: string): Promise<PurchaseOrderRecord[]> {
    return this.records.filter((record) => record.itemId === itemId.value && record.status === status);
  }
}
