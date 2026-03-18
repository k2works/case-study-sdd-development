import { Item } from './item.js';
import { ItemId } from '../shared/value-objects.js';

export interface ItemRepository {
  findById(id: ItemId): Promise<Item | null>;
  findAll(): Promise<Item[]>;
  save(item: Item): Promise<Item>;
}
