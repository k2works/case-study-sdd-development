import express from 'express';
import { createItemRoutes } from './presentation/routes/item-routes.js';
import { createProductRoutes } from './presentation/routes/product-routes.js';
import { createOrderRoutes } from './presentation/routes/order-routes.js';
import { ItemUseCase } from './application/item/item-usecase.js';
import { ProductUseCase } from './application/product/product-usecase.js';
import { OrderUseCase } from './application/order/order-usecase.js';
import { InMemoryItemRepository } from './application/item/in-memory-item-repository.js';
import { InMemoryProductRepository } from './application/product/in-memory-product-repository.js';
import { InMemoryOrderRepository } from './application/order/in-memory-order-repository.js';
import { InMemoryStockLotRepository } from './application/stock/in-memory-stock-lot-repository.js';
import { StockLot } from './domain/stock/stock-lot.js';
import { ItemId, Quantity } from './domain/shared/value-objects.js';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'UP' });
});

const itemRepository = new InMemoryItemRepository();
const itemUseCase = new ItemUseCase(itemRepository);
app.use('/api', createItemRoutes(itemUseCase));

const productRepository = new InMemoryProductRepository();
const productUseCase = new ProductUseCase(productRepository);
app.use('/api', createProductRoutes(productUseCase));

const orderRepository = new InMemoryOrderRepository();
const stockLotRepository = new InMemoryStockLotRepository();
const orderUseCase = new OrderUseCase(orderRepository, productRepository, stockLotRepository);
app.use('/api', createOrderRoutes(orderUseCase));

app.post('/api/test/reset', (_req, res) => {
  itemRepository.clear();
  productRepository.clear();
  orderRepository.clear();
  stockLotRepository.clear();
  res.status(204).send();
});

app.post('/api/test/stock-lots', async (req, res) => {
  const itemId = Number(req.body.itemId);
  const quantity = Number(req.body.quantity ?? 100);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    res.status(400).json({ error: 'itemId は正の整数で指定してください' });
    return;
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    res.status(400).json({ error: 'quantity は正の整数で指定してください' });
    return;
  }

  const lot = await stockLotRepository.save(
    StockLot.createNew({
      itemId: new ItemId(itemId),
      quantity: new Quantity(quantity),
      arrivalDate: new Date('2026-03-15'),
      expiryDate: new Date('2026-03-30'),
    }),
  );

  res.status(201).json({
    id: lot.stockId?.value ?? null,
    itemId: lot.itemId.value,
    quantity: lot.quantity.value,
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
