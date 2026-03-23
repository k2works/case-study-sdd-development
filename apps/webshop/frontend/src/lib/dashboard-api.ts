import api from './api'
import type { DashboardSummary } from '../types/order'

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/admin/dashboard/summary'),
}
