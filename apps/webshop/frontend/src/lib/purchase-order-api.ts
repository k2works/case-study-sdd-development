import api from './api'
import type { PurchaseOrder, PurchaseOrderRequest } from '../types/purchase-order'

export const purchaseOrderApi = {
  create: (data: PurchaseOrderRequest) =>
    api.post<PurchaseOrder>('/admin/purchase-orders', data),
  getById: (id: number) =>
    api.get<PurchaseOrder>(`/admin/purchase-orders/${id}`),
  getAll: (status?: string) =>
    api.get<PurchaseOrder[]>('/admin/purchase-orders', {
      params: status ? { status } : {},
    }),
}
