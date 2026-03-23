import api from './api'
import type { OrderResponse } from '../types/order'

export interface RescheduleCheckResponse {
  available: boolean
  reason: string | null
  shortageItems: Record<string, number>
  alternativeDates: string[]
}

export const orderAdminApi = {
  findAll: (params?: { status?: string; from?: string; to?: string }) =>
    api.get<OrderResponse[]>('/admin/orders', { params }),
  findById: (id: number) => api.get<OrderResponse>(`/admin/orders/${id}`),
  acceptOrder: (id: number) => api.put<OrderResponse>(`/admin/orders/${id}/accept`),
  bulkAcceptOrders: (orderIds: number[]) =>
    api.put<OrderResponse[]>('/admin/orders/bulk-accept', { orderIds }),
  cancelOrder: (id: number) => api.put<OrderResponse>(`/admin/orders/${id}/cancel`),
  shipOrder: (id: number) => api.put<OrderResponse>(`/admin/orders/${id}/ship`),
  rescheduleOrder: (id: number, newDeliveryDate: string) =>
    api.put<OrderResponse>(`/admin/orders/${id}/reschedule`, { newDeliveryDate }),
  checkReschedule: (id: number, date: string) =>
    api.get<RescheduleCheckResponse>(`/admin/orders/${id}/reschedule-check`, { params: { date } }),
}
