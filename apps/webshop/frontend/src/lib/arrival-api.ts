import api from './api'
import type { ArrivalResponse, RegisterArrivalRequest } from '../types/arrival'

export const arrivalApi = {
  register: (purchaseOrderId: number, data: RegisterArrivalRequest) =>
    api.post<ArrivalResponse>(
      `/admin/purchase-orders/${purchaseOrderId}/arrivals`,
      data
    ),
}
