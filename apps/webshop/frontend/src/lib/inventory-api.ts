import api from './api'
import type { DailyInventory } from '../types/stock'

export const inventoryApi = {
  getTransition: (itemId: number, from: string, to: string) =>
    api.get<DailyInventory[]>('/admin/inventory/transition', {
      params: { itemId, from, to },
    }),
}
