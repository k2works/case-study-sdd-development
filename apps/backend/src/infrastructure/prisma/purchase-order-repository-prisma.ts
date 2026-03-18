import { PrismaClient } from '../../generated/prisma/client.js';
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import {
  PurchaseOrderRecord,
  PurchaseOrderRepository,
} from '../../domain/purchase-order/purchase-order-repository.js';
import {
  ItemId,
  PurchaseOrderId,
  PurchaseOrderStatus,
  PurchaseOrderStatusValue,
  Quantity,
  SupplierId,
} from '../../domain/shared/value-objects.js';

export class PrismaPurchaseOrderRepository implements PurchaseOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: PurchaseOrderId): Promise<PurchaseOrder | null> {
    const record = await this.prisma.purchaseOrder.findUnique({
      where: { purchaseOrderId: id.value },
    });
    if (!record) return null;
    return this.toDomain(record as PurchaseOrderRecord);
  }

  async save(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> {
    if (!purchaseOrder.purchaseOrderId) {
      const record = await this.prisma.purchaseOrder.create({
        data: {
          itemId: purchaseOrder.itemId.value,
          supplierId: purchaseOrder.supplierId.value,
          quantity: purchaseOrder.quantity.value,
          orderDate: purchaseOrder.orderDate,
          expectedArrivalDate: purchaseOrder.expectedArrivalDate,
          status: purchaseOrder.status.value,
        },
      });
      return this.toDomain(record);
    }

    const record = await this.prisma.purchaseOrder.update({
      where: { purchaseOrderId: purchaseOrder.purchaseOrderId.value },
      data: {
        itemId: purchaseOrder.itemId.value,
        supplierId: purchaseOrder.supplierId.value,
        quantity: purchaseOrder.quantity.value,
        orderDate: purchaseOrder.orderDate,
        expectedArrivalDate: purchaseOrder.expectedArrivalDate,
        status: purchaseOrder.status.value,
      },
    });
    return this.toDomain(record);
  }

  async findByStatus(status: string): Promise<PurchaseOrderRecord[]> {
    const records = await this.prisma.purchaseOrder.findMany({
      where: { status },
      orderBy: { purchaseOrderId: 'asc' },
    });
    return records.map((record) => this.toRecord(record));
  }

  async findByItemIdAndStatus(itemId: ItemId, status: string): Promise<PurchaseOrderRecord[]> {
    const records = await this.prisma.purchaseOrder.findMany({
      where: {
        itemId: itemId.value,
        status,
      },
      orderBy: { purchaseOrderId: 'asc' },
    });
    return records.map((record) => this.toRecord(record));
  }

  private toDomain(record: PurchaseOrderRecord): PurchaseOrder {
    return new PurchaseOrder({
      purchaseOrderId: new PurchaseOrderId(record.purchaseOrderId),
      itemId: new ItemId(record.itemId),
      supplierId: new SupplierId(record.supplierId),
      quantity: new Quantity(record.quantity),
      orderDate: record.orderDate,
      expectedArrivalDate: record.expectedArrivalDate,
      status: new PurchaseOrderStatus(record.status as PurchaseOrderStatusValue),
    });
  }

  private toRecord(record: PurchaseOrderRecord): PurchaseOrderRecord {
    return {
      purchaseOrderId: record.purchaseOrderId,
      itemId: record.itemId,
      supplierId: record.supplierId,
      quantity: record.quantity,
      orderDate: record.orderDate,
      expectedArrivalDate: record.expectedArrivalDate,
      status: record.status,
    };
  }
}
