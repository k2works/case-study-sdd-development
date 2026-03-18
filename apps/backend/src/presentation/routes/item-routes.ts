import { Router } from 'express';
import { ItemUseCase } from '../../application/item/item-usecase.js';

export interface SupplierNameResolver {
  resolve(supplierId: number): Promise<string>;
}

export function createItemRoutes(useCase: ItemUseCase, supplierNameResolver?: SupplierNameResolver): Router {
  const router = Router();

  router.get('/items', async (_req, res) => {
    const items = await useCase.findAll();
    const result = await Promise.all(
      items.map(async (item) => ({
        id: item.itemId!.value,
        name: item.name.value,
        qualityRetentionDays: item.qualityRetentionDays.value,
        purchaseUnit: item.purchaseUnit.value,
        leadTimeDays: item.leadTimeDays.value,
        supplierId: item.supplierId.value,
        supplierName: supplierNameResolver
          ? await supplierNameResolver.resolve(item.supplierId.value)
          : `仕入先 ${item.supplierId.value}`,
      })),
    );
    res.json(result);
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
