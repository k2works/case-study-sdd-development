export interface PurchaseOrderRecord {
  purchaseOrderId: number;
  itemId: number;
  supplierId: number;
  quantity: number;
  orderDate: string;
  expectedArrivalDate: string;
  status: string;
}

export interface RegisterArrivalInput {
  purchaseOrderId: number;
  quantity: number;
  arrivalDate: string;
}

export interface RegisterArrivalResult {
  arrivalId: number;
  itemId: number;
  purchaseOrderId: number;
  quantity: number;
  arrivalDate: string;
  status: string;
}
