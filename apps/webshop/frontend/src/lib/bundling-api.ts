import api from './api'
import type { BundlingTargetsResponse, BundleOrderResponse } from '../types/bundling'

export const bundlingApi = {
  getTargets: (date?: string) =>
    api.get<BundlingTargetsResponse>('/admin/bundling/targets', {
      params: date ? { date } : undefined,
    }),
  bundleOrder: (orderId: number) =>
    api.put<BundleOrderResponse>(`/admin/bundling/orders/${orderId}/bundle`),
}
