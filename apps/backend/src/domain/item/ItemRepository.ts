import type { Item } from './Item.js'

export interface ItemRepository {
  findAll(): Promise<Item[]>
  findById(id: number): Promise<Item | null>
  save(item: Item): Promise<Item>
  update(id: number, item: Item): Promise<Item>
  delete(id: number): Promise<void>
}
