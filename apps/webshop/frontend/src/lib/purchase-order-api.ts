import api from './api'
import type { PurchaseOrder, PurchaseOrderRequest } from '../types/purchase-order'

export const purchaseOrderApi = {
  create: (data: PurchaseOrderRequest) =>
    api.post<PurchaseOrder>('/admin/purchase-orders', data),
  getAll: (status?: string) =>
    api.get<PurchaseOrder[]>('/admin/purchase-orders', {
      params: status ? { status } : {},
    }),
}
