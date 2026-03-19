import { Router } from 'express';
import { Order } from '../../domain/order/order.js';
import { OrderUseCase } from '../../application/order/order-usecase.js';

function toResponse(order: Order, productName: string) {
  return {
    id: order.orderId!.value,
    customerId: order.customerId.value,
    productId: order.productId.value,
    productName,
    price: order.price.value,
    destination: {
      name: order.destination.name,
      address: order.destination.address,
      phone: order.destination.phone,
    },
    deliveryDate: order.deliveryDate.value.toISOString().split('T')[0],
    shippingDate: order.shippingDate.value.toISOString().split('T')[0],
    message: order.message.value,
    status: order.status.value,
  };
}

export function createOrderRoutes(useCase: OrderUseCase): Router {
  const router = Router();

  router.post('/orders', async (req, res) => {
    try {
      const order = await useCase.createOrder(req.body);
      const productName = await useCase.getProductName(order.productId);
      res.status(201).json(toResponse(order, productName));
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  router.get('/orders', async (req, res) => {
    const status = req.query.status as string | undefined;
    const orders = await useCase.findAll(status);
    const responses = await Promise.all(
      orders.map(async (order) => {
        const productName = await useCase.getProductName(order.productId);
        return toResponse(order, productName);
      }),
    );
    res.json(responses);
  });

  router.put('/orders/:id/delivery-date', async (req, res) => {
    const id = Number(req.params.id);
    const { newDeliveryDate } = req.body;

    try {
      const result = await useCase.changeDeliveryDate(id, newDeliveryDate);
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  router.put('/orders/:id/cancel', async (req, res) => {
    const id = Number(req.params.id);

    try {
      const result = await useCase.cancelOrder(id);
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  router.get('/orders/:id', async (req, res) => {
    const order = await useCase.findById(Number(req.params.id));
    if (!order) {
      res.status(404).json({ error: '受注が見つかりません' });
      return;
    }
    const productName = await useCase.getProductName(order.productId);
    res.json(toResponse(order, productName));
  });

  return router;
}
