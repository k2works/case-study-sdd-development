export type ProductComposition = {
  itemId: number
  quantity: number
}

export type Product = {
  id: number
  name: string
  price: number
  compositions: ProductComposition[]
  isActive: boolean
}

export type ProductInput = Omit<Product, 'id' | 'isActive'>

const BASE = '/api/admin/products'

export const productsApi = {
  getAll: (): Promise<Product[]> =>
    fetch(BASE).then((r) => r.json()),

  create: (input: ProductInput): Promise<Product> =>
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => r.json()),

  update: (id: number, input: ProductInput): Promise<Product> =>
    fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => r.json()),

  delete: (id: number): Promise<void> =>
    fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(() => undefined),
}
