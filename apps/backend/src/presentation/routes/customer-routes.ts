import { Router } from 'express';
import { CustomerUseCase } from '../../application/customer/customer-usecase.js';
import { OrderUseCase } from '../../application/order/order-usecase.js';

export function createCustomerRoutes(useCase: CustomerUseCase, orderUseCase?: OrderUseCase): Router {
  const router = Router();

  // 得意先一覧
  router.get('/customers', async (_req, res) => {
    try {
      const customers = await useCase.getCustomers();
      res.json(customers);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // 得意先登録
  router.post('/customers', async (req, res) => {
    const { name, phone, email } = req.body;

    if (!name) {
      res.status(400).json({ error: 'name は必須です' });
      return;
    }
    if (!phone) {
      res.status(400).json({ error: 'phone は必須です' });
      return;
    }

    try {
      const result = await useCase.createCustomer({
        name,
        phone,
        email: email ?? null,
      });
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  // 得意先更新
  router.put('/customers/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { name, phone, email } = req.body;

    try {
      const result = await useCase.updateCustomer(id, {
        name,
        phone,
        email: email ?? null,
      });
      res.json(result);
    } catch (e) {
      const message = (e as Error).message;
      if (message === '得意先が見つかりません') {
        res.status(404).json({ error: message });
        return;
      }
      res.status(400).json({ error: message });
    }
  });

  // 届け先一覧
  router.get('/customers/:id/destinations', async (req, res) => {
    const customerId = Number(req.params.id);

    try {
      const destinations = await useCase.getDestinations(customerId);
      res.json(destinations);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // 過去の注文から届け先を重複排除して取得
  router.get('/customers/:id/order-destinations', async (req, res) => {
    const customerId = Number(req.params.id);

    try {
      if (!orderUseCase) {
        res.json([]);
        return;
      }
      const destinations = await orderUseCase.getOrderDestinations(customerId);
      res.json(destinations);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  return router;
}
