import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductManagement } from './ProductManagement';
import type { ProductDto, CreateProductInput } from '../../types/product';
import type { ItemDto } from '../../types/item';

const mockProducts: ProductDto[] = [
  { id: 1, name: 'ローズブーケ', price: 5500, compositions: [{ itemId: 1, quantity: 5 }] },
  { id: 2, name: 'スプリングミックス', price: 3800, compositions: [] },
];

const mockItems: ItemDto[] = [
  { id: 1, name: '赤バラ', qualityRetentionDays: 7, purchaseUnit: 100, leadTimeDays: 3, supplierId: 1 },
  { id: 2, name: 'カスミソウ', qualityRetentionDays: 14, purchaseUnit: 200, leadTimeDays: 1, supplierId: 1 },
];

const mockFetchProducts = vi.fn<() => Promise<ProductDto[]>>();
const mockCreateProduct = vi.fn<(input: CreateProductInput) => Promise<ProductDto>>();
const mockUpdateProduct = vi.fn<(id: number, input: CreateProductInput) => Promise<ProductDto>>();
const mockFetchItems = vi.fn<() => Promise<ItemDto[]>>();

describe('ProductManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchProducts.mockResolvedValue(mockProducts);
    mockFetchItems.mockResolvedValue(mockItems);
  });

  it('商品一覧が表示される', async () => {
    render(
      <ProductManagement
        fetchProducts={mockFetchProducts}
        createProduct={mockCreateProduct}
        updateProduct={mockUpdateProduct}
        fetchItems={mockFetchItems}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      expect(screen.getByText('スプリングミックス')).toBeInTheDocument();
    });
  });

  it('価格がフォーマットされて表示される', async () => {
    render(
      <ProductManagement
        fetchProducts={mockFetchProducts}
        createProduct={mockCreateProduct}
        updateProduct={mockUpdateProduct}
        fetchItems={mockFetchItems}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('¥5,500')).toBeInTheDocument();
    });
  });

  it('新規登録ボタンでフォームが表示される', async () => {
    render(
      <ProductManagement
        fetchProducts={mockFetchProducts}
        createProduct={mockCreateProduct}
        updateProduct={mockUpdateProduct}
        fetchItems={mockFetchItems}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('新規登録'));

    expect(screen.getByLabelText('商品名')).toBeInTheDocument();
    expect(screen.getByLabelText('価格（税込）')).toBeInTheDocument();
  });

  it('編集ボタンで既存データがフォームに表示される', async () => {
    render(
      <ProductManagement
        fetchProducts={mockFetchProducts}
        createProduct={mockCreateProduct}
        updateProduct={mockUpdateProduct}
        fetchItems={mockFetchItems}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('編集');
    await userEvent.click(editButtons[0]);

    expect(screen.getByLabelText('商品名')).toHaveValue('ローズブーケ');
    expect(screen.getByLabelText('価格（税込）')).toHaveValue(5500);
  });
});
