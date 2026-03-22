export interface RequiredItem {
  itemId: number
  itemName: string
  requiredQuantity: number
}

export interface BundlingTarget {
  orderId: number
  productName: string
  deliveryDate: string
  status: string
  requiredItems: RequiredItem[]
}

export interface MaterialSummary {
  itemId: number
  itemName: string
  requiredQuantity: number
  availableStock: number
  shortage: number
}

export interface BundlingTargetsResponse {
  shippingDate: string
  targets: BundlingTarget[]
  materialSummary: MaterialSummary[]
}

export interface BundleOrderResponse {
  orderId: number
  status: string
}
