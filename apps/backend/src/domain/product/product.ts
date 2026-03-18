import { ProductId, ProductName, Price, ItemId, Quantity } from '../shared/value-objects.js';

export class ProductComposition {
  constructor(
    public readonly itemId: ItemId,
    public readonly quantity: Quantity,
  ) {}
}

export interface ProductProps {
  productId: ProductId;
  name: ProductName;
  price: Price;
  compositions: ProductComposition[];
}

export type NewProductProps = Omit<ProductProps, 'productId'>;

export class Product {
  readonly productId: ProductId;
  readonly name: ProductName;
  readonly price: Price;
  readonly compositions: ProductComposition[];

  static createNew(props: NewProductProps): Product {
    return new Product({ ...props, productId: undefined as unknown as ProductId });
  }

  constructor(props: ProductProps) {
    this.productId = props.productId;
    this.name = props.name;
    this.price = props.price;
    this.compositions = [...props.compositions];
  }

  changeName(name: ProductName): Product {
    return new Product({ ...this, name });
  }

  changePrice(price: Price): Product {
    return new Product({ ...this, price });
  }

  changeCompositions(compositions: ProductComposition[]): Product {
    return new Product({ ...this, compositions });
  }
}
