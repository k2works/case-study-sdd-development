import { PrismaClient } from '../../generated/prisma/client.js';
import { Item } from '../../domain/item/item.js';
import { ItemRepository } from '../../domain/item/item-repository.js';
import { ItemId, ItemName, Days, PurchaseUnit, SupplierId } from '../../domain/shared/value-objects.js';

export class PrismaItemRepository implements ItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: ItemId): Promise<Item | null> {
    const record = await this.prisma.item.findUnique({
      where: { itemId: id.value },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(): Promise<Item[]> {
    const records = await this.prisma.item.findMany({
      orderBy: { itemId: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(item: Item): Promise<Item> {
    if (!item.itemId) {
      const record = await this.prisma.item.create({
        data: {
          name: item.name.value,
          qualityRetentionDays: item.qualityRetentionDays.value,
          purchaseUnit: item.purchaseUnit.value,
          leadTimeDays: item.leadTimeDays.value,
          supplierId: item.supplierId.value,
        },
      });
      return this.toDomain(record);
    }

    const record = await this.prisma.item.update({
      where: { itemId: item.itemId.value },
      data: {
        name: item.name.value,
        qualityRetentionDays: item.qualityRetentionDays.value,
        purchaseUnit: item.purchaseUnit.value,
        leadTimeDays: item.leadTimeDays.value,
        supplierId: item.supplierId.value,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    itemId: number;
    name: string;
    qualityRetentionDays: number;
    purchaseUnit: number;
    leadTimeDays: number;
    supplierId: number;
  }): Item {
    return new Item({
      itemId: new ItemId(record.itemId),
      name: new ItemName(record.name),
      qualityRetentionDays: new Days(record.qualityRetentionDays),
      purchaseUnit: new PurchaseUnit(record.purchaseUnit),
      leadTimeDays: new Days(record.leadTimeDays),
      supplierId: new SupplierId(record.supplierId),
    });
  }
}
