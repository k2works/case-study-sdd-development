export interface StockForecastDto {
  date: string;
  itemId: number;
  currentStock: number;
  expectedArrival: number;
  allocated: number;
  expired: number;
  availableStock: number;
  isShortage: boolean;
  isExpiryWarning: boolean;
}
