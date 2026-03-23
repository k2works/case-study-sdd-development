import api from './api'
import type { OrderResponse, DashboardSummary } from '../types/order'

export const orderAdminApi = {
  findAll: (params?: { status?: string; from?: string; to?: string }) =>
    api.get<OrderResponse[]>('/admin/orders', { params }),
  findById: (id: number) => api.get<OrderResponse>(`/admin/orders/${id}`),
  acceptOrder: (id: number) => api.put<OrderResponse>(`/admin/orders/${id}/accept`),
  bulkAcceptOrders: (orderIds: number[]) =>
    api.put<OrderResponse[]>('/admin/orders/bulk-accept', { orderIds }),
  cancelOrder: (id: number) => api.put<OrderResponse>(`/admin/orders/${id}/cancel`),
  shipOrder: (id: number) => api.put<OrderResponse>(`/admin/orders/${id}/ship`),
  getDashboardSummary: () => api.get<DashboardSummary>('/admin/dashboard/summary'),
}
