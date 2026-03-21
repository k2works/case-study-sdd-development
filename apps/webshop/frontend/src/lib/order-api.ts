import api from './api'
import type { OrderRequest, OrderResponse } from '../types/order'

export const orderApi = {
  placeOrder: (data: OrderRequest) => api.post<OrderResponse>('/orders', data),
  getMyOrders: () => api.get<OrderResponse[]>('/orders/my'),
}
