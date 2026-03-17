import { PrismaClient } from '../../generated/prisma/client.js';
import { PurchaseOrder } from '../../domain/purchase-order/purchase-order.js';
import { PurchaseOrderRepository } from '../../domain/purchase-order/purchase-order-repository.js';
import { PurchaseOrderId, PurchaseOrderStatus, ItemId, SupplierId, Quantity } from '../../domain/shared/value-objects.js';

export class PrismaPurchaseOrderRepository implements PurchaseOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: PurchaseOrderId): Promise<PurchaseOrder | null> {
    const record = await this.prisma.purchaseOrder.findUnique({
      where: { purchaseOrderId: id.value },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByItemId(itemId: ItemId): Promise<PurchaseOrder[]> {
    const records = await this.prisma.purchaseOrder.findMany({
      where: { itemId: itemId.value },
    });
    return records.map(this.toDomain);
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
        status: purchaseOrder.status.value,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    purchaseOrderId: number;
    itemId: number;
    supplierId: number;
    quantity: number;
    orderDate: Date;
    expectedArrivalDate: Date;
    status: string;
  }): PurchaseOrder {
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
}
