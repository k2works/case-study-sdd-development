export interface ProductComposition {
  id: number
  itemId: number
  itemName: string
  quantity: number
}

export interface Product {
  id: number
  name: string
  price: number
  description: string | null
  active: boolean
  compositions: ProductComposition[]
  createdAt: string
  updatedAt: string
}

export interface ProductRequest {
  name: string
  price: number
  description: string | null
}

export interface CompositionRequest {
  itemId: number
  quantity: number
}
