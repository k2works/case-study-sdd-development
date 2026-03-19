import { Item } from '../../domain/item/Item.js'
import type { ItemRepository } from '../../domain/item/ItemRepository.js'

type ItemInput = { name: string; supplierId: number; shelfLife: number }

export class ItemService {
  constructor(private readonly repo: ItemRepository) {}

  async getAll(): Promise<Item[]> { return this.repo.findAll() }

  async create(input: ItemInput): Promise<Item> {
    return this.repo.save(Item.create(input))
  }

  async update(id: number, input: ItemInput): Promise<Item> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error('単品が見つかりません')
    return this.repo.update(id, existing.update(input))
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error('単品が見つかりません')
    await this.repo.update(id, existing.deactivate())
  }
}
