import { Product, type ProductComposition } from '../../domain/product/Product.js'
import type { ProductRepository } from '../../domain/product/ProductRepository.js'

type ProductInput = {
  name: string
  price: number
  compositions: ProductComposition[]
}

export class ProductService {
  constructor(private readonly repo: ProductRepository) {}

  async getAll(): Promise<Product[]> {
    return this.repo.findAll()
  }

  async create(input: ProductInput): Promise<Product> {
    const product = Product.create(input)
    return this.repo.save(product)
  }

  async update(id: number, input: ProductInput): Promise<Product> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error('商品が見つかりません')
    const updated = existing.update(input)
    return this.repo.update(id, updated)
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error('商品が見つかりません')
    await this.repo.update(id, existing.deactivate())
  }
}
