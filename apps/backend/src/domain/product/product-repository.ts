import { Product } from './product.js';
import { ProductId } from '../shared/value-objects.js';

export interface ProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<Product>;
}
