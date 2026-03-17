import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderList } from './OrderList';
import type { OrderDto } from '../../types/order';

const mockOrders: OrderDto[] = [
  {
    id: 1,
    customerId: 1,
    productId: 1,
    price: 5500,
    destination: { name: '山田太郎', address: '東京都渋谷区1-1-1', phone: '03-1234-5678' },
    deliveryDate: '2026-04-01',
    shippingDate: '2026-03-30',
    message: 'お誕生日おめでとう',
    status: '注文済み',
  },
  {
    id: 2,
    customerId: 2,
    productId: 2,
    price: 3800,
    destination: { name: '佐藤花子', address: '大阪府大阪市2-2-2', phone: '06-9876-5432' },
    deliveryDate: '2026-04-05',
    shippingDate: '2026-04-03',
    message: '',
    status: '出荷準備中',
  },
];

const mockFetchOrders = vi.fn<(status?: string) => Promise<OrderDto[]>>();
const mockOnDetail = vi.fn();

describe('OrderList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchOrders.mockResolvedValue(mockOrders);
  });

  it('受注一覧テーブルが表示される', async () => {
    render(<OrderList fetchOrders={mockFetchOrders} onDetail={mockOnDetail} />);

    await waitFor(() => {
      expect(screen.getByRole('table', { name: '受注一覧' })).toBeInTheDocument();
    });
  });

  it('受注データが表示される', async () => {
    render(<OrderList fetchOrders={mockFetchOrders} onDetail={mockOnDetail} />);

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    });

    // 状態はフィルタの option にも存在するため、テーブル行内で確認
    const table = screen.getByRole('table', { name: '受注一覧' });
    const rows = table.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('注文済み');
    expect(rows[1]).toHaveTextContent('出荷準備中');
  });

  it('状態フィルタが表示される', async () => {
    render(<OrderList fetchOrders={mockFetchOrders} onDetail={mockOnDetail} />);

    await waitFor(() => {
      expect(screen.getByLabelText('状態フィルタ')).toBeInTheDocument();
    });
  });

  it('状態フィルタで絞り込みができる', async () => {
    mockFetchOrders
      .mockResolvedValueOnce(mockOrders)
      .mockResolvedValueOnce([mockOrders[0]]);

    render(<OrderList fetchOrders={mockFetchOrders} onDetail={mockOnDetail} />);

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText('状態フィルタ'), '注文済み');

    await waitFor(() => {
      expect(mockFetchOrders).toHaveBeenCalledWith('注文済み');
    });
  });

  it('詳細ボタンが各行に表示される', async () => {
    render(<OrderList fetchOrders={mockFetchOrders} onDetail={mockOnDetail} />);

    await waitFor(() => {
      const detailButtons = screen.getAllByRole('button', { name: '詳細' });
      expect(detailButtons).toHaveLength(2);
    });
  });

  it('詳細ボタンを押すと onDetail が受注 ID と共に呼ばれる', async () => {
    render(<OrderList fetchOrders={mockFetchOrders} onDetail={mockOnDetail} />);

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole('button', { name: '詳細' });
    await userEvent.click(detailButtons[0]);

    expect(mockOnDetail).toHaveBeenCalledWith(1);
  });
});
