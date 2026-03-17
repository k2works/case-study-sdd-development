import { fetchApi } from './client';
import type { StockForecastDto } from '../types/stock-forecast';

export const fetchStockForecast = async (
  itemId: number,
  fromDate: string,
  toDate: string,
): Promise<StockForecastDto[]> => {
  return fetchApi<StockForecastDto[]>(
    `/stock/forecast?itemId=${itemId}&fromDate=${fromDate}&toDate=${toDate}`,
  );
};
