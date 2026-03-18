import { PrismaClient } from '../../generated/prisma/client.js';
import { Product, ProductComposition } from '../../domain/product/product.js';
import { ProductRepository } from '../../domain/product/product-repository.js';
import { ProductId, ProductName, Price, ItemId, Quantity } from '../../domain/shared/value-objects.js';

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: ProductId): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { productId: id.value },
      include: { compositions: true },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      include: { compositions: true },
      orderBy: { productId: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(product: Product): Promise<Product> {
    if (!product.productId) {
      const record = await this.prisma.product.create({
        data: {
          name: product.name.value,
          price: product.price.value,
          compositions: {
            create: product.compositions.map((c) => ({
              itemId: c.itemId.value,
              quantity: c.quantity.value,
            })),
          },
        },
        include: { compositions: true },
      });
      return this.toDomain(record);
    }

    // 構成を差し替え（既存削除→再作成）
    await this.prisma.productComposition.deleteMany({
      where: { productId: product.productId.value },
    });

    const record = await this.prisma.product.update({
      where: { productId: product.productId.value },
      data: {
        name: product.name.value,
        price: product.price.value,
        compositions: {
          create: product.compositions.map((c) => ({
            itemId: c.itemId.value,
            quantity: c.quantity.value,
          })),
        },
      },
      include: { compositions: true },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    productId: number;
    name: string;
    price: number;
    compositions: { itemId: number; quantity: number }[];
  }): Product {
    return new Product({
      productId: new ProductId(record.productId),
      name: new ProductName(record.name),
      price: new Price(record.price),
      compositions: record.compositions.map(
        (c) => new ProductComposition(new ItemId(c.itemId), new Quantity(c.quantity)),
      ),
    });
  }
}
