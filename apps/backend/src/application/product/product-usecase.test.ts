import { describe, it, expect, beforeEach } from 'vitest';
import { ProductUseCase } from './product-usecase.js';
import { InMemoryProductRepository } from './in-memory-product-repository.js';

describe('ProductUseCase', () => {
  let useCase: ProductUseCase;

  beforeEach(() => {
    useCase = new ProductUseCase(new InMemoryProductRepository());
  });

  describe('create', () => {
    it('商品を登録できる', async () => {
      const product = await useCase.create({
        name: 'ローズブーケ',
        price: 5500,
        compositions: [
          { itemId: 1, quantity: 5 },
          { itemId: 2, quantity: 3 },
        ],
      });

      expect(product.name.value).toBe('ローズブーケ');
      expect(product.price.value).toBe(5500);
      expect(product.compositions).toHaveLength(2);
    });

    it('不正な名前でエラー', async () => {
      await expect(
        useCase.create({ name: '', price: 5500, compositions: [] }),
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('登録済みの商品を取得できる', async () => {
      const created = await useCase.create({
        name: 'ローズブーケ',
        price: 5500,
        compositions: [{ itemId: 1, quantity: 5 }],
      });

      const found = await useCase.findById(created.productId.value);
      expect(found).not.toBeNull();
      expect(found!.name.value).toBe('ローズブーケ');
    });

    it('存在しない ID は null を返す', async () => {
      const found = await useCase.findById(999);
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('全件取得できる', async () => {
      await useCase.create({ name: 'ローズブーケ', price: 5500, compositions: [] });
      await useCase.create({ name: 'スプリングミックス', price: 3800, compositions: [] });

      const products = await useCase.findAll();
      expect(products).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('商品を更新できる', async () => {
      const created = await useCase.create({
        name: 'ローズブーケ',
        price: 5500,
        compositions: [{ itemId: 1, quantity: 5 }],
      });

      const updated = await useCase.update({
        id: created.productId.value,
        name: 'スプリングミックス',
        price: 3800,
        compositions: [{ itemId: 2, quantity: 10 }],
      });

      expect(updated.name.value).toBe('スプリングミックス');
      expect(updated.price.value).toBe(3800);
      expect(updated.compositions).toHaveLength(1);
    });

    it('存在しない ID でエラー', async () => {
      await expect(
        useCase.update({ id: 999, name: 'テスト', price: 1000, compositions: [] }),
      ).rejects.toThrow('商品が見つかりません');
    });
  });
});
