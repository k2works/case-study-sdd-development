import type { ItemDto, CreateItemInput } from '../types/item';

const API_BASE = '/api';

export const fetchItems = async (): Promise<ItemDto[]> => {
  const res = await fetch(`${API_BASE}/items`);
  return res.json();
};

export const createItem = async (input: CreateItemInput): Promise<ItemDto> => {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

export const updateItem = async (id: number, input: CreateItemInput): Promise<ItemDto> => {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};
