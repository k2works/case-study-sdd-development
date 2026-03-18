import { Router } from 'express';
import { ProductUseCase } from '../../application/product/product-usecase.js';

export function createProductRoutes(useCase: ProductUseCase): Router {
  const router = Router();

  router.get('/products', async (_req, res) => {
    const products = await useCase.findAll();
    res.json(
      products.map((p) => ({
        id: p.productId.value,
        name: p.name.value,
        price: p.price.value,
        compositions: p.compositions.map((c) => ({
          itemId: c.itemId.value,
          quantity: c.quantity.value,
        })),
      })),
    );
  });

  router.post('/products', async (req, res) => {
    try {
      const product = await useCase.create(req.body);
      res.status(201).json({
        id: product.productId.value,
        name: product.name.value,
        price: product.price.value,
        compositions: product.compositions.map((c) => ({
          itemId: c.itemId.value,
          quantity: c.quantity.value,
        })),
      });
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  router.put('/products/:id', async (req, res) => {
    try {
      const product = await useCase.update({
        id: Number(req.params.id),
        ...req.body,
      });
      res.json({
        id: product.productId.value,
        name: product.name.value,
        price: product.price.value,
        compositions: product.compositions.map((c) => ({
          itemId: c.itemId.value,
          quantity: c.quantity.value,
        })),
      });
    } catch (e) {
      const message = (e as Error).message;
      if (message === '商品が見つかりません') {
        res.status(404).json({ error: message });
      } else {
        res.status(400).json({ error: message });
      }
    }
  });

  return router;
}
