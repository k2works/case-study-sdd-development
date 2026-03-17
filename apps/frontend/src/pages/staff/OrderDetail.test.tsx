import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderDetail } from './OrderDetail';
import type { OrderDto } from '../../types/order';

const mockOrder: OrderDto = {
  id: 1,
  customerId: 1,
  productId: 1,
  productName: 'ローズブーケ',
  price: 5500,
  destination: {
    name: '山田太郎',
    address: '東京都渋谷区1-1-1',
    phone: '03-1234-5678',
  },
  deliveryDate: '2026-04-01',
  shippingDate: '2026-03-30',
  message: 'お誕生日おめでとう',
  status: '注文済み',
};

const mockFetchOrder = vi.fn<(id: number) => Promise<OrderDto>>();
const mockOnBack = vi.fn();

describe('OrderDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchOrder.mockResolvedValue(mockOrder);
  });

  it('受注の全情報が表示される', async () => {
    render(<OrderDetail orderId={1} fetchOrder={mockFetchOrder} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      expect(screen.getByText('注文済み')).toBeInTheDocument();
      expect(screen.getByText('¥5,500（税込）')).toBeInTheDocument();
      expect(screen.getByText('2026-04-01')).toBeInTheDocument();
      expect(screen.getByText('2026-03-30')).toBeInTheDocument();
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('東京都渋谷区1-1-1')).toBeInTheDocument();
      expect(screen.getByText('03-1234-5678')).toBeInTheDocument();
      expect(screen.getByText('お誕生日おめでとう')).toBeInTheDocument();
    });
  });

  it('fetchOrder が orderId で呼ばれる', async () => {
    render(<OrderDetail orderId={1} fetchOrder={mockFetchOrder} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(mockFetchOrder).toHaveBeenCalledWith(1);
    });
  });

  it('戻るボタンが存在する', async () => {
    render(<OrderDetail orderId={1} fetchOrder={mockFetchOrder} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
  });

  it('戻るボタンを押すと onBack が呼ばれる', async () => {
    render(<OrderDetail orderId={1} fetchOrder={mockFetchOrder} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: '戻る' }));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('読み込み中は読み込み中メッセージが表示される', () => {
    mockFetchOrder.mockReturnValue(new Promise(() => {})); // never resolves

    render(<OrderDetail orderId={1} fetchOrder={mockFetchOrder} onBack={mockOnBack} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});
