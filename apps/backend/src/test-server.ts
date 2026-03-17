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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
