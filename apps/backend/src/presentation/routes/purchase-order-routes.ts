import { Router } from 'express';
import { PurchaseOrderUseCase } from '../../application/purchase-order/purchase-order-usecase.js';

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function createPurchaseOrderRoutes(purchaseOrderUseCase: PurchaseOrderUseCase): Router {
  const router = Router();

  router.post('/purchase-orders', async (req, res) => {
    const { itemId, quantity } = req.body;

    if (!isPositiveInteger(itemId)) {
      res.status(400).json({ error: 'itemId は正の整数で指定してください' });
      return;
    }

    if (!isPositiveInteger(quantity)) {
      res.status(400).json({ error: 'quantity は正の整数で指定してください' });
      return;
    }

    try {
      const purchaseOrder = await purchaseOrderUseCase.createPurchaseOrder(itemId, quantity);
      res.status(201).json(purchaseOrder);
    } catch (e) {
      const message = (e as Error).message;
      if (message === '単品が見つかりません') {
        res.status(404).json({ error: message });
        return;
      }

      res.status(500).json({ error: message });
    }
  });

  return router;
}
