import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchApi } from './client';

describe('fetchApi', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('GET リクエストで JSON データを返す', async () => {
    const mockData = [{ id: 1, name: 'テスト' }];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchApi('/items');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/items', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockData);
  });

  it('POST リクエストでボディを送信できる', async () => {
    const mockResponse = { id: 1 };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const body = { name: 'テスト' };
    const result = await fetchApi('/items', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    expect(result).toEqual(mockResponse);
  });

  it('レスポンスが ok でない場合エラーを投げる', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ message: '見つかりません' }),
    });

    await expect(fetchApi('/items/999')).rejects.toThrow('見つかりません');
  });

  it('レスポンスが ok でなく JSON パースに失敗した場合 statusText をエラーメッセージにする', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('parse error')),
    });

    await expect(fetchApi('/items')).rejects.toThrow('Internal Server Error');
  });
});
