export interface StockForecastDay {
  date: string;
  currentStock: number;
  expectedArrival: number;
  allocated: number;
  expired: number;
  availableStock: number;
  isShortage: boolean;
  isExpiryWarning: boolean;
}

export interface StockForecastItem {
  itemId: number;
  itemName: string;
  qualityRetentionDays: number;
  forecasts: StockForecastDay[];
}
