import express from 'express';
import { createItemRoutes } from './routes/item-routes.js';
import { createProductRoutes } from './routes/product-routes.js';
import { ItemUseCase } from '../application/item/item-usecase.js';
import { ProductUseCase } from '../application/product/product-usecase.js';
import { PrismaItemRepository } from '../infrastructure/prisma/item-repository-prisma.js';
import { PrismaProductRepository } from '../infrastructure/prisma/product-repository-prisma.js';
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

export { app };
