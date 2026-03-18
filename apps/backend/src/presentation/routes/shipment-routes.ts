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
    if (Number.isNaN(date.getTime())) {
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

  // 出荷記録
  router.post('/shipments', async (req, res) => {
    const { orderId } = req.body;

    if (typeof orderId !== 'number' || !Number.isInteger(orderId) || orderId <= 0) {
      res.status(400).json({ error: 'orderId は正の整数で指定してください' });
      return;
    }

    try {
      await shipmentUseCase.recordShipment(orderId);
      res.status(200).json({ message: '出荷を記録しました' });
    } catch (e) {
      const message = (e as Error).message;
      if (message === '受注が見つかりません') {
        res.status(404).json({ error: message });
        return;
      }
      res.status(400).json({ error: message });
    }
  });

  return router;
}
