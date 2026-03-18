import { Router } from 'express';
import { StockForecastUseCase } from '../../application/stock/stock-forecast-usecase.js';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createStockForecastRoutes(useCase: StockForecastUseCase): Router {
  const router = Router();

  router.get('/stock/forecast', async (req, res) => {
    try {
      const fromDate = req.query.fromDate as string;
      const toDate = req.query.toDate as string;
      const itemId = req.query.itemId ? Number(req.query.itemId) : undefined;

      if (!fromDate || !toDate) {
        res.status(400).json({ error: 'fromDate と toDate は必須です' });
        return;
      }

      const results = await useCase.getForecast(
        new Date(fromDate),
        new Date(toDate),
        itemId,
      );

      res.json(
        results.map((result) => ({
          itemId: result.itemId,
          itemName: result.itemName,
          qualityRetentionDays: result.qualityRetentionDays,
          forecasts: result.forecasts.map((forecast) => ({
            date: formatDate(forecast.date),
            currentStock: forecast.currentStock,
            expectedArrival: forecast.expectedArrival,
            allocated: forecast.allocated,
            expired: forecast.expired,
            availableStock: forecast.availableStock,
            isShortage: forecast.isShortage,
            isExpiryWarning: forecast.isExpiryWarning,
          })),
        })),
      );
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  return router;
}
