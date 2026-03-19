type ItemProps = {
  id?: number
  name: string
  supplierId: number
  shelfLife: number
  isActive?: boolean
}

export class Item {
  readonly id?: number
  readonly name: string
  readonly supplierId: number
  readonly shelfLife: number
  readonly isActive: boolean

  private constructor(props: Required<ItemProps>) {
    this.id = props.id
    this.name = props.name
    this.supplierId = props.supplierId
    this.shelfLife = props.shelfLife
    this.isActive = props.isActive
  }

  static create(props: Omit<ItemProps, 'id' | 'isActive'>): Item {
    if (!props.name) throw new Error('単品名は必須です')
    if (props.shelfLife <= 0) throw new Error('品質維持日数は1以上である必要があります')
    return new Item({ ...props, id: undefined, isActive: true })
  }

  static reconstruct(props: Required<ItemProps>): Item {
    return new Item(props)
  }

  deactivate(): Item {
    return new Item({ id: this.id, name: this.name, supplierId: this.supplierId, shelfLife: this.shelfLife, isActive: false })
  }

  update(props: Omit<ItemProps, 'id' | 'isActive'>): Item {
    return Item.create(props)
  }
}
