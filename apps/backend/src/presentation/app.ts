import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createItemRoutes } from './routes/item-routes.js';
import { createProductRoutes } from './routes/product-routes.js';
import { createOrderRoutes } from './routes/order-routes.js';
import { createPurchaseOrderRoutes } from './routes/purchase-order-routes.js';
import { createStockForecastRoutes } from './routes/stock-forecast-routes.js';
import { ItemUseCase } from '../application/item/item-usecase.js';
import { ProductUseCase } from '../application/product/product-usecase.js';
import { OrderUseCase } from '../application/order/order-usecase.js';
import { PurchaseOrderUseCase } from '../application/purchase-order/purchase-order-usecase.js';
import { StockForecastUseCase } from '../application/stock/stock-forecast-usecase.js';
import { PrismaItemRepository } from '../infrastructure/prisma/item-repository-prisma.js';
import { PrismaProductRepository } from '../infrastructure/prisma/product-repository-prisma.js';
import { PrismaOrderRepository } from '../infrastructure/prisma/order-repository-prisma.js';
import { PrismaPurchaseOrderRepository } from '../infrastructure/prisma/purchase-order-repository-prisma.js';
import { PrismaStockLotRepository } from '../infrastructure/prisma/stock-lot-repository-prisma.js';
import { prisma } from '../infrastructure/prisma/client.js';

const app = express();

app.use(express.json());

// ヘルスチェック
app.get('/api/health', (_req, res) => {
  res.json({ status: 'UP' });
});

// 単品 API
const itemRepository = new PrismaItemRepository(prisma);
const itemUseCase = new ItemUseCase(itemRepository);
app.use('/api', createItemRoutes(itemUseCase));

// 商品 API
const productRepository = new PrismaProductRepository(prisma);
const productUseCase = new ProductUseCase(productRepository);
app.use('/api', createProductRoutes(productUseCase));

// 受注 API
const orderRepository = new PrismaOrderRepository(prisma);
const stockLotRepository = new PrismaStockLotRepository(prisma);
const orderUseCase = new OrderUseCase(orderRepository, productRepository, stockLotRepository);
app.use('/api', createOrderRoutes(orderUseCase));

// 発注 API
const purchaseOrderRepository = new PrismaPurchaseOrderRepository(prisma);
const purchaseOrderUseCase = new PurchaseOrderUseCase(purchaseOrderRepository, itemRepository);
app.use('/api', createPurchaseOrderRoutes(purchaseOrderUseCase));

// 在庫推移 API
const stockForecastUseCase = new StockForecastUseCase(
  stockLotRepository,
  purchaseOrderRepository,
  orderRepository,
  productRepository,
  itemRepository,
);
app.use('/api', createStockForecastRoutes(stockForecastUseCase));

// 静的ファイル配信（デモ環境用: フロントエンドビルド成果物）
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = process.env.PUBLIC_DIR || path.resolve(__dirname, '../../public');
app.use(express.static(publicDir));

// SPA フォールバック: API 以外のパスは index.html を返す
app.get('{*path}', (_req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

export { app };
