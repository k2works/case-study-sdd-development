import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProductList } from './ProductList';
import type { ProductDto } from '../../types/product';
import type { ItemDto } from '../../types/item';

const mockProducts: ProductDto[] = [
  {
    id: 1,
    name: 'ローズブーケ',
    price: 5500,
    compositions: [
      { itemId: 1, quantity: 5 },
      { itemId: 2, quantity: 3 },
    ],
  },
  {
    id: 2,
    name: 'スプリングミックス',
    price: 3800,
    compositions: [{ itemId: 2, quantity: 10 }],
  },
];

const mockItems: ItemDto[] = [
  { id: 1, name: '赤バラ', qualityRetentionDays: 7, purchaseUnit: 100, leadTimeDays: 3, supplierId: 1 },
  { id: 2, name: 'カスミソウ', qualityRetentionDays: 14, purchaseUnit: 200, leadTimeDays: 1, supplierId: 1 },
];

const mockFetchProducts = vi.fn<() => Promise<ProductDto[]>>();
const mockFetchItems = vi.fn<() => Promise<ItemDto[]>>();

describe('ProductList（得意先向け）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchProducts.mockResolvedValue(mockProducts);
    mockFetchItems.mockResolvedValue(mockItems);
  });

  it('花束一覧が表示される', async () => {
    render(<ProductList fetchProducts={mockFetchProducts} fetchItems={mockFetchItems} />);

    await waitFor(() => {
      expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      expect(screen.getByText('スプリングミックス')).toBeInTheDocument();
    });
  });

  it('価格が税込で表示される', async () => {
    render(<ProductList fetchProducts={mockFetchProducts} fetchItems={mockFetchItems} />);

    await waitFor(() => {
      expect(screen.getByText('¥5,500（税込）')).toBeInTheDocument();
      expect(screen.getByText('¥3,800（税込）')).toBeInTheDocument();
    });
  });

  it('構成が説明として表示される', async () => {
    render(<ProductList fetchProducts={mockFetchProducts} fetchItems={mockFetchItems} />);

    await waitFor(() => {
      expect(screen.getByText('赤バラx5, カスミソウx3')).toBeInTheDocument();
    });
  });

  it('注文するボタンが各商品に表示される', async () => {
    render(<ProductList fetchProducts={mockFetchProducts} fetchItems={mockFetchItems} />);

    await waitFor(() => {
      const orderButtons = screen.getAllByText('注文する');
      expect(orderButtons).toHaveLength(2);
    });
  });

  it('商品がない場合メッセージが表示される', async () => {
    mockFetchProducts.mockResolvedValue([]);

    render(<ProductList fetchProducts={mockFetchProducts} fetchItems={mockFetchItems} />);

    await waitFor(() => {
      expect(screen.getByText('現在、商品はありません')).toBeInTheDocument();
    });
  });
});
