import { PrismaClient } from '../../generated/prisma/client.js';
import { Arrival } from '../../domain/arrival/arrival.js';
import { ArrivalRepository } from '../../domain/arrival/arrival-repository.js';
import {
  ArrivalId,
  ItemId,
  PurchaseOrderId,
  Quantity,
} from '../../domain/shared/value-objects.js';

export class PrismaArrivalRepository implements ArrivalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(arrival: Arrival): Promise<Arrival> {
    if (!arrival.arrivalId) {
      const record = await this.prisma.arrival.create({
        data: {
          itemId: arrival.itemId.value,
          purchaseOrderId: arrival.purchaseOrderId.value,
          quantity: arrival.quantity.value,
          arrivalDate: arrival.arrivalDate,
        },
      });
      return this.toDomain(record);
    }

    const record = await this.prisma.arrival.update({
      where: { arrivalId: arrival.arrivalId.value },
      data: {
        itemId: arrival.itemId.value,
        purchaseOrderId: arrival.purchaseOrderId.value,
        quantity: arrival.quantity.value,
        arrivalDate: arrival.arrivalDate,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    arrivalId: number;
    itemId: number;
    purchaseOrderId: number;
    quantity: number;
    arrivalDate: Date;
  }): Arrival {
    return new Arrival({
      arrivalId: new ArrivalId(record.arrivalId),
      itemId: new ItemId(record.itemId),
      purchaseOrderId: new PurchaseOrderId(record.purchaseOrderId),
      quantity: new Quantity(record.quantity),
      arrivalDate: record.arrivalDate,
    });
  }
}
