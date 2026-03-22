export interface RegisterArrivalRequest {
  quantity: number
  arrivedDate: string
}

export interface ArrivalResponse {
  id: number
  purchaseOrderId: number
  itemId: number
  quantity: number
  arrivedAt: string
}
