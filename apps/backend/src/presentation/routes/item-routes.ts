import { Router } from 'express';
import { ItemUseCase } from '../../application/item/item-usecase.js';

export function createItemRoutes(useCase: ItemUseCase): Router {
  const router = Router();

  router.get('/items', async (_req, res) => {
    const items = await useCase.findAll();
    res.json(
      items.map((item) => ({
        id: item.itemId.value,
        name: item.name.value,
        qualityRetentionDays: item.qualityRetentionDays.value,
        purchaseUnit: item.purchaseUnit.value,
        leadTimeDays: item.leadTimeDays.value,
        supplierId: item.supplierId.value,
      })),
    );
  });

  router.post('/items', async (req, res) => {
    try {
      const item = await useCase.create(req.body);
      res.status(201).json({
        id: item.itemId.value,
        name: item.name.value,
        qualityRetentionDays: item.qualityRetentionDays.value,
        purchaseUnit: item.purchaseUnit.value,
        leadTimeDays: item.leadTimeDays.value,
        supplierId: item.supplierId.value,
      });
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  router.put('/items/:id', async (req, res) => {
    try {
      const item = await useCase.update({
        id: Number(req.params.id),
        ...req.body,
      });
      res.json({
        id: item.itemId.value,
        name: item.name.value,
        qualityRetentionDays: item.qualityRetentionDays.value,
        purchaseUnit: item.purchaseUnit.value,
        leadTimeDays: item.leadTimeDays.value,
        supplierId: item.supplierId.value,
      });
    } catch (e) {
      const message = (e as Error).message;
      if (message === '単品が見つかりません') {
        res.status(404).json({ error: message });
      } else {
        res.status(400).json({ error: message });
      }
    }
  });

  return router;
}
