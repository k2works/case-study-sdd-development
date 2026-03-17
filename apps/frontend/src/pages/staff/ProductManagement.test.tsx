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

  it('構成がUI設計に沿った形式で表示される', async () => {
    render(
      <ProductManagement
        fetchProducts={mockFetchProducts}
        createProduct={mockCreateProduct}
        updateProduct={mockUpdateProduct}
        fetchItems={mockFetchItems}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('赤バラx5')).toBeInTheDocument();
    });
  });

  it('テーブルにaria-labelが設定されている', async () => {
    render(
      <ProductManagement
        fetchProducts={mockFetchProducts}
        createProduct={mockCreateProduct}
        updateProduct={mockUpdateProduct}
        fetchItems={mockFetchItems}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('table', { name: '商品一覧' })).toBeInTheDocument();
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

  it('新規登録フォームで構成を追加できる', async () => {
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
    await userEvent.click(screen.getByText('構成を追加'));

    expect(screen.getByLabelText('構成 1 の単品')).toBeInTheDocument();
    expect(screen.getByLabelText('構成 1 の数量')).toHaveValue(1);
  });

  it('構成を削除できる', async () => {
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
    await userEvent.click(screen.getByText('構成を追加'));
    expect(screen.getByLabelText('構成 1 の単品')).toBeInTheDocument();

    await userEvent.click(screen.getByText('削除'));
    expect(screen.queryByLabelText('構成 1 の単品')).not.toBeInTheDocument();
  });

  it('構成の単品と数量を変更できる', async () => {
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
    await userEvent.click(screen.getByText('構成を追加'));

    // 単品を変更
    await userEvent.selectOptions(screen.getByLabelText('構成 1 の単品'), '2');
    expect(screen.getByLabelText('構成 1 の単品')).toHaveValue('2');

    // 数量を変更
    const qtyInput = screen.getByLabelText('構成 1 の数量');
    await userEvent.clear(qtyInput);
    await userEvent.type(qtyInput, '3');
    expect(qtyInput).toHaveValue(3);
  });

  it('新規商品を保存できる', async () => {
    const newProduct: ProductDto = { id: 3, name: '新商品', price: 4000, compositions: [{ itemId: 1, quantity: 2 }] };
    mockCreateProduct.mockResolvedValue(newProduct);

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

    await userEvent.type(screen.getByLabelText('商品名'), '新商品');
    await userEvent.clear(screen.getByLabelText('価格（税込）'));
    await userEvent.type(screen.getByLabelText('価格（税込）'), '4000');
    await userEvent.click(screen.getByText('構成を追加'));
    await userEvent.click(screen.getByText('保存する'));

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith({
        name: '新商品',
        price: 4000,
        compositions: [{ itemId: 1, quantity: 1 }],
      });
    });
  });

  it('既存商品を更新できる', async () => {
    const updatedProduct: ProductDto = { id: 1, name: 'ローズブーケ改', price: 6000, compositions: [{ itemId: 1, quantity: 5 }] };
    mockUpdateProduct.mockResolvedValue(updatedProduct);

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

    await userEvent.clear(screen.getByLabelText('商品名'));
    await userEvent.type(screen.getByLabelText('商品名'), 'ローズブーケ改');
    await userEvent.click(screen.getByText('保存する'));

    await waitFor(() => {
      expect(mockUpdateProduct).toHaveBeenCalledWith(1, {
        name: 'ローズブーケ改',
        price: 5500,
        compositions: [{ itemId: 1, quantity: 5 }],
      });
    });
  });
});
