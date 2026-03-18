import { Router } from 'express';
import { ArrivalUseCase } from '../../application/arrival/arrival-usecase.js';
import { PurchaseOrderRepository } from '../../domain/purchase-order/purchase-order-repository.js';

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function createArrivalRoutes(
  arrivalUseCase: ArrivalUseCase,
  purchaseOrderRepository: PurchaseOrderRepository,
): Router {
  const router = Router();

  // 発注済み一覧取得（入荷登録画面用）
  router.get('/purchase-orders', async (req, res) => {
    const status = (req.query.status as string) || '発注済み';
    try {
      const records = await purchaseOrderRepository.findByStatus(status);
      res.json(records);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // 入荷登録
  router.post('/arrivals', async (req, res) => {
    const { purchaseOrderId, quantity, arrivalDate } = req.body;

    if (!isPositiveInteger(purchaseOrderId)) {
      res.status(400).json({ error: 'purchaseOrderId は正の整数で指定してください' });
      return;
    }

    if (!isPositiveInteger(quantity)) {
      res.status(400).json({ error: 'quantity は正の整数で指定してください' });
      return;
    }

    if (!arrivalDate) {
      res.status(400).json({ error: 'arrivalDate は必須です' });
      return;
    }

    try {
      const result = await arrivalUseCase.registerArrival({
        purchaseOrderId,
        quantity,
        arrivalDate: new Date(arrivalDate),
      });
      res.status(201).json(result);
    } catch (e) {
      const message = (e as Error).message;
      if (message === '発注が見つかりません') {
        res.status(404).json({ error: message });
        return;
      }
      if (
        message === '既に入荷済みです' ||
        message === '入荷数量は発注数量と一致する必要があります' ||
        message === '単品が見つかりません'
      ) {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  });

  return router;
}
