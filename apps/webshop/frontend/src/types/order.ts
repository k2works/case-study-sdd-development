export interface OrderResponse {
  id: number
  customerId: number
  productId: number
  deliveryDestinationId: number
  deliveryDate: string
  message: string | null
  status: string
  orderedAt: string
  updatedAt: string
}

export interface OrderRequest {
  productId: number
  deliveryDate: string
  recipientName: string
  postalCode: string
  address: string
  phone?: string
  message?: string
}

export interface DashboardSummary {
  totalOrders: number
  orderedCount: number
  acceptedCount: number
}
