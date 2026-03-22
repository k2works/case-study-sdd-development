export interface Item {
  id: number
  name: string
  qualityRetentionDays: number
  purchaseUnit: number
  leadTimeDays: number
  supplierName: string
}

export interface ItemRequest {
  name: string
  qualityRetentionDays: number
  purchaseUnit: number
  leadTimeDays: number
  supplierName: string
}
