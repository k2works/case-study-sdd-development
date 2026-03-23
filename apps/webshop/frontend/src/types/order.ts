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
  productName: string | null
  customerName: string | null
  recipientName: string | null
  deliveryAddress: string | null
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

export interface OrderFormData {
  recipientName: string
  postalCode: string
  address: string
  phone: string
  deliveryDate: string
  message: string
}

export interface DashboardSummary {
  totalOrders: number
  orderedCount: number
}
