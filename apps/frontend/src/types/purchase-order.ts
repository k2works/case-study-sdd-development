export interface PurchaseOrderInput {
  itemId: number;
  quantity: number;
}

export interface PurchaseOrderResult {
  purchaseOrderId: number;
  itemId: number;
  supplierId: number;
  quantity: number;
  orderDate: string;
  expectedArrivalDate: string;
  status: string;
}

export interface ItemInfo {
  itemId: number;
  itemName: string;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierId: number;
  supplierName: string;
}
