import api from './api'
import type { Product, ProductRequest, CompositionRequest, ProductComposition } from '../types/product'

export const productApi = {
  findAll: () => api.get<Product[]>('/products'),
  findById: (id: number) => api.get<Product>(`/products/${id}`),
  create: (data: ProductRequest) => api.post<Product>('/products', data),
  update: (id: number, data: ProductRequest) => api.put<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  getCompositions: (productId: number) => api.get<ProductComposition[]>(`/products/${productId}/compositions`),
  addComposition: (productId: number, data: CompositionRequest) =>
    api.post<Product>(`/products/${productId}/compositions`, data),
  removeComposition: (productId: number, itemId: number) =>
    api.delete(`/products/${productId}/compositions/${itemId}`),
}

export const catalogApi = {
  findAll: () => api.get<Product[]>('/catalog/products'),
  findById: (id: number) => api.get<Product>(`/catalog/products/${id}`),
}
