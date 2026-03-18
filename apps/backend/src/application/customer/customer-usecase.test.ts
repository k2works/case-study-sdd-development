import { describe, it, expect, beforeEach } from 'vitest';
import { CustomerUseCase } from './customer-usecase.js';
import { InMemoryCustomerRepository } from './in-memory-customer-repository.js';

describe('CustomerUseCase', () => {
  let useCase: CustomerUseCase;
  let repository: InMemoryCustomerRepository;

  beforeEach(() => {
    repository = new InMemoryCustomerRepository();
    useCase = new CustomerUseCase(repository);
  });

  describe('createCustomer', () => {
    it('得意先を登録できる', async () => {
      const result = await useCase.createCustomer({
        name: '山田花店',
        phone: '03-1234-5678',
        email: 'yamada@example.com',
      });

      expect(result.customerId).toBeGreaterThan(0);
      expect(result.name).toBe('山田花店');
      expect(result.phone).toBe('03-1234-5678');
      expect(result.email).toBe('yamada@example.com');
    });

    it('メールなしでも登録できる', async () => {
      const result = await useCase.createCustomer({
        name: '鈴木花店',
        phone: '06-9876-5432',
        email: null,
      });

      expect(result.customerId).toBeGreaterThan(0);
      expect(result.email).toBeNull();
    });

    it('名前が空の場合はエラーになる', async () => {
      await expect(
        useCase.createCustomer({ name: '', phone: '03-1234-5678', email: null }),
      ).rejects.toThrow('得意先名は1〜100文字でなければなりません');
    });
  });

  describe('getCustomers', () => {
    it('得意先一覧を取得できる', async () => {
      await useCase.createCustomer({ name: '山田花店', phone: '03-1111-1111', email: null });
      await useCase.createCustomer({ name: '鈴木花店', phone: '03-2222-2222', email: null });

      const customers = await useCase.getCustomers();

      expect(customers).toHaveLength(2);
      expect(customers[0].name).toBe('山田花店');
      expect(customers[1].name).toBe('鈴木花店');
    });

    it('登録がなければ空配列を返す', async () => {
      const customers = await useCase.getCustomers();
      expect(customers).toHaveLength(0);
    });
  });

  describe('getCustomerById', () => {
    it('ID で得意先を取得できる', async () => {
      const created = await useCase.createCustomer({
        name: '山田花店',
        phone: '03-1111-1111',
        email: null,
      });

      const found = await useCase.getCustomerById(created.customerId);

      expect(found).not.toBeNull();
      expect(found!.name).toBe('山田花店');
    });

    it('存在しない ID は null を返す', async () => {
      const found = await useCase.getCustomerById(999);
      expect(found).toBeNull();
    });
  });

  describe('updateCustomer', () => {
    it('得意先を更新できる', async () => {
      const created = await useCase.createCustomer({
        name: '山田花店',
        phone: '03-1111-1111',
        email: null,
      });

      const updated = await useCase.updateCustomer(created.customerId, {
        name: '山田フラワー',
        phone: '03-9999-9999',
        email: 'yamada@flower.com',
      });

      expect(updated.name).toBe('山田フラワー');
      expect(updated.phone).toBe('03-9999-9999');
      expect(updated.email).toBe('yamada@flower.com');
    });

    it('存在しない得意先の更新はエラーになる', async () => {
      await expect(
        useCase.updateCustomer(999, { name: '存在しない', phone: '000', email: null }),
      ).rejects.toThrow('得意先が見つかりません');
    });
  });

  describe('getDestinations', () => {
    it('得意先の届け先一覧を取得できる', async () => {
      const created = await useCase.createCustomer({
        name: '山田花店',
        phone: '03-1111-1111',
        email: null,
      });

      await useCase.addDestination(created.customerId, {
        name: '本店',
        address: '東京都渋谷区1-1-1',
        phone: '03-1111-1111',
      });
      await useCase.addDestination(created.customerId, {
        name: '支店',
        address: '大阪府大阪市2-2-2',
        phone: '06-2222-2222',
      });

      const destinations = await useCase.getDestinations(created.customerId);

      expect(destinations).toHaveLength(2);
      expect(destinations[0].name).toBe('本店');
      expect(destinations[1].name).toBe('支店');
    });

    it('届け先がなければ空配列を返す', async () => {
      const created = await useCase.createCustomer({
        name: '山田花店',
        phone: '03-1111-1111',
        email: null,
      });

      const destinations = await useCase.getDestinations(created.customerId);
      expect(destinations).toHaveLength(0);
    });
  });
});
