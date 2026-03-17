import { Item } from '../../domain/item/item.js';
import { ItemRepository } from '../../domain/item/item-repository.js';
import { ItemId, ItemName, Days, PurchaseUnit, SupplierId } from '../../domain/shared/value-objects.js';

export interface CreateItemInput {
  name: string;
  qualityRetentionDays: number;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierId: number;
}

export interface UpdateItemInput {
  id: number;
  name: string;
  qualityRetentionDays: number;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierId: number;
}

export class ItemUseCase {
  constructor(private readonly repository: ItemRepository) {}

  async create(input: CreateItemInput): Promise<Item> {
    const item = Item.createNew({
      name: new ItemName(input.name),
      qualityRetentionDays: new Days(input.qualityRetentionDays),
      purchaseUnit: new PurchaseUnit(input.purchaseUnit),
      leadTimeDays: new Days(input.leadTimeDays),
      supplierId: new SupplierId(input.supplierId),
    });
    return this.repository.save(item);
  }

  async findById(id: number): Promise<Item | null> {
    return this.repository.findById(new ItemId(id));
  }

  async findAll(): Promise<Item[]> {
    return this.repository.findAll();
  }

  async update(input: UpdateItemInput): Promise<Item> {
    const existing = await this.repository.findById(new ItemId(input.id));
    if (!existing) {
      throw new Error('単品が見つかりません');
    }

    const updated = new Item({
      itemId: existing.itemId,
      name: new ItemName(input.name),
      qualityRetentionDays: new Days(input.qualityRetentionDays),
      purchaseUnit: new PurchaseUnit(input.purchaseUnit),
      leadTimeDays: new Days(input.leadTimeDays),
      supplierId: new SupplierId(input.supplierId),
    });

    return this.repository.save(updated);
  }
}
