export interface Item {
  id: number
  name: string
  shelfLifeDays: number
  purchaseUnit: number
  leadTimeDays: number
  supplierName: string
}

export interface ItemRequest {
  name: string
  shelfLifeDays: number
  purchaseUnit: number
  leadTimeDays: number
  supplierName: string
}
