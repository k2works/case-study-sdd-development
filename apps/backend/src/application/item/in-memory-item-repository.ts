import { Item } from '../../domain/item/item.js';
import { ItemRepository } from '../../domain/item/item-repository.js';
import { ItemId } from '../../domain/shared/value-objects.js';

export class InMemoryItemRepository implements ItemRepository {
  private readonly items: Map<number, Item> = new Map();
  private nextId = 1;

  async findById(id: ItemId): Promise<Item | null> {
    return this.items.get(id.value) ?? null;
  }

  async findAll(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async save(item: Item): Promise<Item> {
    if (!item.itemId) {
      const id = this.nextId++;
      const saved = new Item({
        ...item,
        itemId: new ItemId(id),
      });
      this.items.set(id, saved);
      return saved;
    }
    this.items.set(item.itemId.value, item);
    return item;
  }
}
