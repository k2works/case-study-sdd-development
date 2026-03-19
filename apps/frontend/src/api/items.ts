export type Item = {
  id: number
  name: string
  supplierId: number
  shelfLife: number
  isActive: boolean
}

export type ItemInput = Omit<Item, 'id' | 'isActive'>

const BASE = '/api/admin/items'

export const itemsApi = {
  getAll: (): Promise<Item[]> => fetch(BASE).then((r) => r.json()),
  create: (input: ItemInput): Promise<Item> =>
    fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }).then((r) => r.json()),
  update: (id: number, input: ItemInput): Promise<Item> =>
    fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }).then((r) => r.json()),
  delete: (id: number): Promise<void> =>
    fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(() => undefined),
}
