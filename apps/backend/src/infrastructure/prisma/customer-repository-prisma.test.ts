import { beforeEach, describe, expect, it } from 'vitest';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaCustomerRepository } from './customer-repository-prisma.js';
import { Customer } from '../../domain/customer/customer.js';
import { Destination } from '../../domain/customer/destination.js';
import { CustomerId } from '../../domain/shared/value-objects.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev';

const pool = new pg.Pool({ connectionString: DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

describe('PrismaCustomerRepository（統合テスト）', () => {
  let repository: PrismaCustomerRepository;

  beforeEach(async () => {
    repository = new PrismaCustomerRepository(prisma);
    await prisma.destination.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
  });

  describe('save', () => {
    it('新規得意先を作成できる', async () => {
      const customer = Customer.createNew({
        name: '山田花店',
        phone: '03-1234-5678',
        email: 'yamada@example.com',
      });

      const saved = await repository.save(customer);

      expect(saved.customerId).not.toBeNull();
      expect(saved.customerId!.value).toBeGreaterThan(0);
      expect(saved.name).toBe('山田花店');
      expect(saved.phone).toBe('03-1234-5678');
      expect(saved.email).toBe('yamada@example.com');
    });

    it('既存得意先を更新できる', async () => {
      const customer = Customer.createNew({
        name: '山田花店',
        phone: '03-1234-5678',
        email: null,
      });
      const saved = await repository.save(customer);

      const updated = new Customer({
        customerId: saved.customerId,
        name: '山田フラワー',
        phone: '03-9999-9999',
        email: 'yamada@flower.com',
      });
      const result = await repository.save(updated);

      expect(result.customerId!.value).toBe(saved.customerId!.value);
      expect(result.name).toBe('山田フラワー');
      expect(result.email).toBe('yamada@flower.com');
    });
  });

  describe('findAll', () => {
    it('全件取得できる', async () => {
      await repository.save(Customer.createNew({ name: '山田花店', phone: '03-1111-1111', email: null }));
      await repository.save(Customer.createNew({ name: '鈴木花店', phone: '03-2222-2222', email: null }));

      const customers = await repository.findAll();

      expect(customers).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('ID で取得できる', async () => {
      const saved = await repository.save(
        Customer.createNew({ name: '山田花店', phone: '03-1111-1111', email: 'test@example.com' }),
      );

      const found = await repository.findById(saved.customerId!);

      expect(found).not.toBeNull();
      expect(found!.name).toBe('山田花店');
      expect(found!.email).toBe('test@example.com');
    });

    it('存在しない ID は null を返す', async () => {
      const found = await repository.findById(new CustomerId(99999));
      expect(found).toBeNull();
    });
  });

  describe('destinations', () => {
    it('届け先を追加・取得できる', async () => {
      const customer = await repository.save(
        Customer.createNew({ name: '山田花店', phone: '03-1111-1111', email: null }),
      );

      const destination = Destination.createNew({
        customerId: customer.customerId!,
        name: '本店',
        address: '東京都渋谷区1-1-1',
        phone: '03-1111-1111',
      });
      const savedDest = await repository.addDestination(destination);

      expect(savedDest.destinationId).not.toBeNull();
      expect(savedDest.name).toBe('本店');

      const destinations = await repository.getDestinations(customer.customerId!);
      expect(destinations).toHaveLength(1);
      expect(destinations[0].address).toBe('東京都渋谷区1-1-1');
    });
  });
});
