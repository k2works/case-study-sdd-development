import { describe, it, expect, beforeEach } from 'vitest';
import { ItemUseCase, CreateItemInput, UpdateItemInput } from './item-usecase.js';
import { InMemoryItemRepository } from './in-memory-item-repository.js';

describe('ItemUseCase', () => {
  let useCase: ItemUseCase;
  let repository: InMemoryItemRepository;

  beforeEach(() => {
    repository = new InMemoryItemRepository();
    useCase = new ItemUseCase(repository);
  });

  describe('create', () => {
    it('単品を登録できる', async () => {
      const input: CreateItemInput = {
        name: '赤バラ',
        qualityRetentionDays: 5,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      };

      const item = await useCase.create(input);

      expect(item.name.value).toBe('赤バラ');
      expect(item.qualityRetentionDays.value).toBe(5);
      expect(item.purchaseUnit.value).toBe(100);
      expect(item.leadTimeDays.value).toBe(3);
      expect(item.supplierId.value).toBe(1);
    });

    it('不正な名前でエラー', async () => {
      const input: CreateItemInput = {
        name: '',
        qualityRetentionDays: 5,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      };

      await expect(useCase.create(input)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('登録済みの単品を取得できる', async () => {
      const created = await useCase.create({
        name: '赤バラ',
        qualityRetentionDays: 5,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      });

      const found = await useCase.findById(created.itemId.value);

      expect(found).not.toBeNull();
      expect(found!.name.value).toBe('赤バラ');
    });

    it('存在しない ID は null を返す', async () => {
      const found = await useCase.findById(999);
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('全件取得できる', async () => {
      await useCase.create({
        name: '赤バラ',
        qualityRetentionDays: 5,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      });
      await useCase.create({
        name: 'カスミソウ',
        qualityRetentionDays: 7,
        purchaseUnit: 50,
        leadTimeDays: 2,
        supplierId: 2,
      });

      const items = await useCase.findAll();

      expect(items).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('単品を更新できる', async () => {
      const created = await useCase.create({
        name: '赤バラ',
        qualityRetentionDays: 5,
        purchaseUnit: 100,
        leadTimeDays: 3,
        supplierId: 1,
      });

      const input: UpdateItemInput = {
        id: created.itemId.value,
        name: '白バラ',
        qualityRetentionDays: 7,
        purchaseUnit: 50,
        leadTimeDays: 4,
        supplierId: 2,
      };

      const updated = await useCase.update(input);

      expect(updated.name.value).toBe('白バラ');
      expect(updated.qualityRetentionDays.value).toBe(7);
      expect(updated.purchaseUnit.value).toBe(50);
      expect(updated.leadTimeDays.value).toBe(4);
      expect(updated.supplierId.value).toBe(2);
    });

    it('存在しない ID でエラー', async () => {
      const input: UpdateItemInput = {
        id: 999,
        name: '白バラ',
        qualityRetentionDays: 7,
        purchaseUnit: 50,
        leadTimeDays: 4,
        supplierId: 2,
      };

      await expect(useCase.update(input)).rejects.toThrow('単品が見つかりません');
    });
  });
});
