import api from './api'
import type { OrderResponse } from '../types/order'

export interface ShipmentTarget {
  orderId: number
  productName: string
  deliveryDate: string
  status: string
  recipientName: string | null
  deliveryAddress: string | null
}

export interface ShipmentTargetsResponse {
  deliveryDate: string
  targets: ShipmentTarget[]
}

export const shipmentApi = {
  getTargets: (date?: string) =>
    api.get<ShipmentTargetsResponse>('/admin/shipments', {
      params: date ? { date } : undefined,
    }),
  shipOrder: (orderId: number) =>
    api.put<OrderResponse>(`/admin/orders/${orderId}/ship`),
}
