import { Product } from '../../domain/product/product.js';
import { ProductRepository } from '../../domain/product/product-repository.js';
import { ProductId } from '../../domain/shared/value-objects.js';

export class InMemoryProductRepository implements ProductRepository {
  private readonly products: Map<number, Product> = new Map();
  private nextId = 1;

  clear(): void {
    this.products.clear();
    this.nextId = 1;
  }

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.get(id.value) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async save(product: Product): Promise<Product> {
    if (!product.productId) {
      const id = this.nextId++;
      const saved = new Product({
        ...product,
        productId: new ProductId(id),
      });
      this.products.set(id, saved);
      return saved;
    }
    this.products.set(product.productId.value, product);
    return product;
  }
}
