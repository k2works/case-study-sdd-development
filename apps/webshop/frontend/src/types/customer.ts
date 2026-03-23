export interface CustomerResponse {
  id: number
  name: string
  email: string
  phone: string | null
  createdAt: string
}

export interface OrderSummary {
  id: number
  productName: string
  deliveryDate: string
  status: string
  orderedAt: string
}

export interface CustomerDetailResponse {
  id: number
  name: string
  email: string
  phone: string | null
  createdAt: string
  orders: OrderSummary[]
}
