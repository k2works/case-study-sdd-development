import { Router } from 'express';
import { PurchaseOrderUseCase } from '../../application/purchase-order/purchase-order-usecase.js';

export function createPurchaseOrderRoutes(useCase: PurchaseOrderUseCase): Router {
  const router = Router();

  router.post('/purchase-orders', async (req, res) => {
    try {
      const result = await useCase.createPurchaseOrder(req.body);
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  return router;
}
