export interface DailyInventory {
  date: string
  previousStock: number
  expectedArrivals: number
  orderAllocations: number
  expectedExpirations: number
  projectedStock: number
}
