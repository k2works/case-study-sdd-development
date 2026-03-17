export interface PurchaseOrderDto {
  id: number;
  itemId: number;
  supplierId: number;
  quantity: number;
  orderDate: string;
  expectedArrivalDate: string;
  status: string;
}

export interface CreatePurchaseOrderInput {
  itemId: number;
  quantity: number;
}
