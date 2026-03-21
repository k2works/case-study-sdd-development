import api from './api'
import type { Item, ItemRequest } from '../types/item'

export const itemApi = {
  findAll: () => api.get<Item[]>('/items'),
  findById: (id: number) => api.get<Item>(`/items/${id}`),
  create: (data: ItemRequest) => api.post<Item>('/items', data),
  update: (id: number, data: ItemRequest) => api.put<Item>(`/items/${id}`, data),
  delete: (id: number) => api.delete(`/items/${id}`),
}
