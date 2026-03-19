import { PrismaClient } from '@prisma/client'
import { Product } from '../domain/product/Product.js'
import type { ProductRepository } from '../domain/product/ProductRepository.js'

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { compositions: true },
    })
    return rows.map(this.toEntity)
  }

  async findById(id: number): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: { compositions: true },
    })
    return row ? this.toEntity(row) : null
  }

  async save(product: Product): Promise<Product> {
    const row = await this.prisma.product.create({
      data: {
        name: product.name,
        price: product.price,
        isActive: product.isActive,
        compositions: {
          create: product.compositions.map((c) => ({ itemId: c.itemId, quantity: c.quantity })),
        },
      },
      include: { compositions: true },
    })
    return this.toEntity(row)
  }

  async update(id: number, product: Product): Promise<Product> {
    await this.prisma.productComposition.deleteMany({ where: { productId: id } })
    const row = await this.prisma.product.update({
      where: { id },
      data: {
        name: product.name,
        price: product.price,
        isActive: product.isActive,
        compositions: {
          create: product.compositions.map((c) => ({ itemId: c.itemId, quantity: c.quantity })),
        },
      },
      include: { compositions: true },
    })
    return this.toEntity(row)
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.update({ where: { id }, data: { isActive: false } })
  }

  private toEntity(row: { id: number; name: string; price: number; isActive: boolean; compositions: { itemId: number; quantity: number }[] }): Product {
    return Product.reconstruct({
      id: row.id,
      name: row.name,
      price: row.price,
      isActive: row.isActive,
      compositions: row.compositions.map((c) => ({ itemId: c.itemId, quantity: c.quantity })),
    })
  }
}
