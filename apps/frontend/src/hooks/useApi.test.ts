import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  fetchDestinations,
  fetchOrderDestinations,
  changeDeliveryDate,
} from './useApi';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useApi - Customer API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchCustomers で得意先一覧を取得できる', async () => {
    const customers = [{ customerId: 1, name: 'テスト', phone: '090', email: null }];
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(customers) });

    const result = await fetchCustomers();

    expect(result).toEqual(customers);
    expect(mockFetch).toHaveBeenCalledWith('/api/customers', expect.objectContaining({ headers: expect.any(Object) }));
  });

  it('createCustomer で得意先を登録できる', async () => {
    const input = { name: 'テスト', phone: '090', email: null };
    const created = { customerId: 1, ...input };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(created) });

    const result = await createCustomer(input);

    expect(result).toEqual(created);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/customers',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('updateCustomer で得意先を更新できる', async () => {
    const input = { name: '更新', phone: '080', email: 'test@example.com' };
    const updated = { customerId: 1, ...input };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(updated) });

    const result = await updateCustomer(1, input);

    expect(result).toEqual(updated);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/customers/1',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('fetchDestinations で届け先一覧を取得できる', async () => {
    const destinations = [{ destinationId: 1, customerId: 1, name: '田中', address: '渋谷', phone: '03' }];
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(destinations) });

    const result = await fetchDestinations(1);

    expect(result).toEqual(destinations);
    expect(mockFetch).toHaveBeenCalledWith('/api/customers/1/destinations', expect.any(Object));
  });

  it('fetchOrderDestinations で過去注文の届け先を取得できる', async () => {
    const destinations = [{ destinationId: 0, customerId: 1, name: '鈴木', address: '新宿', phone: '03' }];
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(destinations) });

    const result = await fetchOrderDestinations(1);

    expect(result).toEqual(destinations);
    expect(mockFetch).toHaveBeenCalledWith('/api/customers/1/order-destinations', expect.any(Object));
  });

  it('changeDeliveryDate で届け日を変更できる', async () => {
    const response = { success: true, order: { orderId: 1, deliveryDate: '2026-05-01', shippingDate: '2026-04-30', status: '注文済み' } };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(response) });

    const result = await changeDeliveryDate(1, '2026-05-01');

    expect(result).toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/orders/1/delivery-date',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('API エラー時に例外がスローされる', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: '変更できません' }),
    });

    await expect(changeDeliveryDate(1, '2020-01-01')).rejects.toThrow('変更できません');
  });
});
