import api from './api'
import type { CustomerResponse, CustomerDetailResponse } from '../types/customer'

export const customerApi = {
  getCustomers: (name?: string) =>
    api.get<CustomerResponse[]>('/admin/customers', { params: name ? { name } : undefined }).then(res => res.data),
  getCustomerDetail: (id: number) =>
    api.get<CustomerDetailResponse>(`/admin/customers/${id}`).then(res => res.data),
}
