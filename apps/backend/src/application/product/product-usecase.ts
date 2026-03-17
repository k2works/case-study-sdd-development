import { Product, ProductComposition } from '../../domain/product/product.js';
import { ProductRepository } from '../../domain/product/product-repository.js';
import { ProductId, ProductName, Price, ItemId, Quantity } from '../../domain/shared/value-objects.js';

export interface CompositionInput {
  itemId: number;
  quantity: number;
}

export interface CreateProductInput {
  name: string;
  price: number;
  compositions: CompositionInput[];
}

export interface UpdateProductInput {
  id: number;
  name: string;
  price: number;
  compositions: CompositionInput[];
}

export class ProductUseCase {
  constructor(private readonly repository: ProductRepository) {}

  async create(input: CreateProductInput): Promise<Product> {
    const product = Product.createNew({
      name: new ProductName(input.name),
      price: new Price(input.price),
      compositions: input.compositions.map(
        (c) => new ProductComposition(new ItemId(c.itemId), new Quantity(c.quantity)),
      ),
    });
    return this.repository.save(product);
  }

  async findById(id: number): Promise<Product | null> {
    return this.repository.findById(new ProductId(id));
  }

  async findAll(): Promise<Product[]> {
    return this.repository.findAll();
  }

  async update(input: UpdateProductInput): Promise<Product> {
    const existing = await this.repository.findById(new ProductId(input.id));
    if (!existing) {
      throw new Error('商品が見つかりません');
    }

    const updated = new Product({
      productId: existing.productId,
      name: new ProductName(input.name),
      price: new Price(input.price),
      compositions: input.compositions.map(
        (c) => new ProductComposition(new ItemId(c.itemId), new Quantity(c.quantity)),
      ),
    });

    return this.repository.save(updated);
  }
}
