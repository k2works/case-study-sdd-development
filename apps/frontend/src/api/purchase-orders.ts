import { fetchApi } from './client';
import type { PurchaseOrderDto, CreatePurchaseOrderInput } from '../types/purchase-order';

export const createPurchaseOrder = async (
  input: CreatePurchaseOrderInput,
): Promise<PurchaseOrderDto> => {
  return fetchApi<PurchaseOrderDto>('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};
