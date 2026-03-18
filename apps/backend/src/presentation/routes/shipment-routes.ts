import { Router } from 'express';
import { ShipmentUseCase } from '../../application/shipment/shipment-usecase.js';

export function createShipmentRoutes(shipmentUseCase: ShipmentUseCase): Router {
  const router = Router();

  router.get('/shipments', async (req, res) => {
    const { shippingDate } = req.query;

    if (!shippingDate || typeof shippingDate !== 'string') {
      res.status(400).json({ error: 'shippingDate クエリパラメータは必須です' });
      return;
    }

    const date = new Date(shippingDate);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: 'shippingDate の形式が不正です' });
      return;
    }

    try {
      const result = await shipmentUseCase.getShipmentTargets(date);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  return router;
}
