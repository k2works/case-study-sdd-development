import type { ProductDto, CreateProductInput } from '../types/product';

const API_BASE = '/api';

export const fetchProducts = async (): Promise<ProductDto[]> => {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
};

export const createProduct = async (input: CreateProductInput): Promise<ProductDto> => {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

export const updateProduct = async (id: number, input: CreateProductInput): Promise<ProductDto> => {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};
