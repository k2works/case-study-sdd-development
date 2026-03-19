export type ProductComposition = {
  itemId: number
  quantity: number
}

type ProductProps = {
  id?: number
  name: string
  price: number
  compositions: ProductComposition[]
  isActive?: boolean
}

export class Product {
  readonly id?: number
  readonly name: string
  readonly price: number
  readonly compositions: ProductComposition[]
  readonly isActive: boolean

  private constructor(props: Required<ProductProps>) {
    this.id = props.id
    this.name = props.name
    this.price = props.price
    this.compositions = props.compositions
    this.isActive = props.isActive
  }

  static create(props: Omit<ProductProps, 'id' | 'isActive'>): Product {
    if (!props.name) throw new Error('商品名は必須です')
    if (props.price <= 0) throw new Error('価格は1以上である必要があります')
    if (props.compositions.length === 0) throw new Error('商品構成は1つ以上必要です')
    return new Product({ ...props, id: undefined, isActive: true })
  }

  static reconstruct(props: Required<ProductProps>): Product {
    return new Product(props)
  }

  deactivate(): Product {
    return new Product({ id: this.id, name: this.name, price: this.price, compositions: this.compositions, isActive: false })
  }

  update(props: Omit<ProductProps, 'id' | 'isActive'>): Product {
    return Product.create({ ...props })
  }
}
