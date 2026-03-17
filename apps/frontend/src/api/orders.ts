import { fetchApi } from './client';
import type { OrderDto, CreateOrderInput } from '../types/order';

export const fetchOrders = async (status?: string): Promise<OrderDto[]> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return fetchApi<OrderDto[]>(`/orders${query}`);
};

export const fetchOrder = async (id: number): Promise<OrderDto> => {
  return fetchApi<OrderDto>(`/orders/${id}`);
};

export const createOrder = async (input: CreateOrderInput): Promise<OrderDto> => {
  return fetchApi<OrderDto>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};
