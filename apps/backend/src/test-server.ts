import express from 'express';
import { createItemRoutes } from './presentation/routes/item-routes.js';
import { createProductRoutes } from './presentation/routes/product-routes.js';
import { createOrderRoutes } from './presentation/routes/order-routes.js';
import { createStockForecastRoutes } from './presentation/routes/stock-forecast-routes.js';
import { createPurchaseOrderRoutes } from './presentation/routes/purchase-order-routes.js';
import { createArrivalRoutes } from './presentation/routes/arrival-routes.js';
import { createShipmentRoutes } from './presentation/routes/shipment-routes.js';
import { ItemUseCase } from './application/item/item-usecase.js';
import { ProductUseCase } from './application/product/product-usecase.js';
import { OrderUseCase } from './application/order/order-usecase.js';
import { PurchaseOrderUseCase } from './application/purchase-order/purchase-order-usecase.js';
import { StockForecastUseCase } from './application/stock/stock-forecast-usecase.js';
import { ArrivalUseCase } from './application/arrival/arrival-usecase.js';
import { ShipmentUseCase } from './application/shipment/shipment-usecase.js';
import { InMemoryItemRepository } from './application/item/in-memory-item-repository.js';
import { InMemoryProductRepository } from './application/product/in-memory-product-repository.js';
import { InMemoryOrderRepository } from './application/order/in-memory-order-repository.js';
import { InMemoryStockLotRepository } from './application/stock/in-memory-stock-lot-repository.js';
import { InMemoryPurchaseOrderRepository } from './application/purchase-order/in-memory-purchase-order-repository.js';
import { InMemoryArrivalRepository } from './application/arrival/in-memory-arrival-repository.js';
import { PurchaseOrder } from './domain/purchase-order/purchase-order.js';
import { StockLot } from './domain/stock/stock-lot.js';
import { ItemId, PurchaseOrderStatus, Quantity, SupplierId } from './domain/shared/value-objects.js';

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

const purchaseOrderRepository = new InMemoryPurchaseOrderRepository();
const purchaseOrderUseCase = new PurchaseOrderUseCase(purchaseOrderRepository, itemRepository);
app.use('/api', createPurchaseOrderRoutes(purchaseOrderUseCase));

const arrivalRepository = new InMemoryArrivalRepository();
const arrivalUseCase = new ArrivalUseCase(
  arrivalRepository,
  purchaseOrderRepository,
  stockLotRepository,
  itemRepository,
);
app.use('/api', createArrivalRoutes(arrivalUseCase, purchaseOrderRepository));

const shipmentUseCase = new ShipmentUseCase(orderRepository, productRepository, itemRepository, stockLotRepository);
app.use('/api', createShipmentRoutes(shipmentUseCase));

const stockForecastUseCase = new StockForecastUseCase(
  stockLotRepository,
  purchaseOrderRepository,
  orderRepository,
  productRepository,
  itemRepository,
);
app.use('/api', createStockForecastRoutes(stockForecastUseCase));

app.post('/api/test/reset', (_req, res) => {
  itemRepository.clear();
  productRepository.clear();
  orderRepository.clear();
  stockLotRepository.clear();
  purchaseOrderRepository.clear();
  arrivalRepository.clear();
  res.status(204).send();
});

app.post('/api/test/stock-lots', async (req, res) => {
  const itemId = Number(req.body.itemId);
  const quantity = Number(req.body.quantity ?? 100);
  const arrivalDate = req.body.arrivalDate ? new Date(req.body.arrivalDate) : new Date('2026-03-15');
  const expiryDate = req.body.expiryDate ? new Date(req.body.expiryDate) : new Date('2026-03-30');

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
      arrivalDate,
      expiryDate,
    }),
  );

  res.status(201).json({
    id: lot.stockId?.value ?? null,
    itemId: lot.itemId.value,
    quantity: lot.quantity.value,
  });
});

app.post('/api/test/purchase-orders', async (req, res) => {
  const { itemId, quantity, expectedArrivalDate, status = '発注済み' } = req.body;

  if (!itemId || !quantity || !expectedArrivalDate) {
    res.status(400).json({ error: 'itemId, quantity, expectedArrivalDate は必須です' });
    return;
  }

  const po = await purchaseOrderRepository.save(
    new PurchaseOrder({
      purchaseOrderId: null,
      itemId: new ItemId(Number(itemId)),
      supplierId: new SupplierId(1),
      quantity: new Quantity(Number(quantity)),
      orderDate: new Date(),
      expectedArrivalDate: new Date(expectedArrivalDate),
      status: new PurchaseOrderStatus(status as '発注済み' | '入荷済み'),
    }),
  );

  res.status(201).json({
    purchaseOrderId: po.purchaseOrderId?.value,
    itemId: po.itemId.value,
    quantity: po.quantity.value,
    expectedArrivalDate: po.expectedArrivalDate.toISOString(),
    status: po.status.value,
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
