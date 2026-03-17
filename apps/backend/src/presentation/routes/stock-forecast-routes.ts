import { Router } from 'express';
import { StockForecastUseCase } from '../../application/stock/stock-forecast-usecase.js';

export function createStockForecastRoutes(useCase: StockForecastUseCase): Router {
  const router = Router();

  router.get('/stock/forecast', async (req, res) => {
    try {
      const { itemId, fromDate, toDate } = req.query;

      if (!itemId || !fromDate || !toDate) {
        res.status(400).json({ error: 'itemId, fromDate, toDate は必須です' });
        return;
      }

      const result = await useCase.execute({
        itemId: Number(itemId),
        fromDate: String(fromDate),
        toDate: String(toDate),
      });

      res.json(result);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  return router;
}
