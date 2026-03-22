export interface PurchaseOrder {
  id: number
  itemId: number
  supplierName: string
  quantity: number
  desiredDeliveryDate: string
  status: string
  orderedAt: string
}

export interface PurchaseOrderRequest {
  itemId: number
  quantity: number
  desiredDeliveryDate: string
}
