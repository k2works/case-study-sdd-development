import { fetchApi } from '../api/client';
import type { ItemDto, CreateItemInput } from '../types/item';
import type { ProductDto, CreateProductInput } from '../types/product';
import type { OrderDto, CreateOrderInput } from '../types/order';
import type { StockForecastItem } from '../types/stock-forecast';
import type { PurchaseOrderInput, PurchaseOrderResult, ItemInfo } from '../types/purchase-order';
import type { PurchaseOrderRecord, RegisterArrivalInput, RegisterArrivalResult } from '../types/arrival';
import type { ShipmentResult } from '../types/shipment';

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

export const fetchStockForecast = async (
  fromDate: string,
  toDate: string,
  itemId?: number,
): Promise<StockForecastItem[]> => {
  const params = new URLSearchParams({ fromDate, toDate });
  if (itemId) {
    params.set('itemId', String(itemId));
  }
  return fetchApi<StockForecastItem[]>(`/stock/forecast?${params.toString()}`);
};

export const fetchItemInfo = async (itemId: number): Promise<ItemInfo> => {
  const items = await fetchItems();
  const item = items.find(i => i.id === itemId);
  if (!item) throw new Error('単品が見つかりません');
  return {
    itemId: item.id,
    itemName: item.name,
    purchaseUnit: item.purchaseUnit,
    leadTimeDays: item.leadTimeDays,
    supplierId: item.supplierId,
    supplierName: item.supplierName ?? `仕入先 ${item.supplierId}`,
  };
};

export const createPurchaseOrder = async (input: PurchaseOrderInput): Promise<PurchaseOrderResult> => {
  return fetchApi<PurchaseOrderResult>('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const fetchPurchaseOrders = async (): Promise<PurchaseOrderRecord[]> => {
  return fetchApi<PurchaseOrderRecord[]>('/purchase-orders?status=発注済み');
};

export const registerArrival = async (input: RegisterArrivalInput): Promise<RegisterArrivalResult> => {
  return fetchApi<RegisterArrivalResult>('/arrivals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const fetchShipments = async (shippingDate: string): Promise<ShipmentResult> => {
  return fetchApi<ShipmentResult>(`/shipments?shippingDate=${encodeURIComponent(shippingDate)}`);
};

export const recordShipment = async (orderId: number): Promise<void> => {
  await fetchApi('/shipments', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
};
