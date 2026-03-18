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
const mockChangeDeliveryDate = vi.fn<(orderId: number, newDeliveryDate: string) => Promise<{ success: boolean; reason?: string; order?: { orderId: number; deliveryDate: string; shippingDate: string; status: string } }>>();

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

  describe('届け日変更', () => {
    beforeEach(() => {
      mockChangeDeliveryDate.mockResolvedValue({
        success: true,
        order: { orderId: 1, deliveryDate: '2026-05-01', shippingDate: '2026-04-30', status: '注文済み' },
      });
    });

    it('注文済みの場合、届け日変更セクションが表示される', async () => {
      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          changeDeliveryDate={mockChangeDeliveryDate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('届け日変更')).toBeInTheDocument();
        expect(screen.getByLabelText('新しい届け日')).toBeInTheDocument();
      });
    });

    it('届け日を変更できる', async () => {
      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          changeDeliveryDate={mockChangeDeliveryDate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('届け日変更')).toBeInTheDocument();
      });

      await userEvent.type(screen.getByLabelText('新しい届け日'), '2026-05-01');
      await userEvent.click(screen.getByRole('button', { name: '届け日を変更する' }));

      await waitFor(() => {
        expect(mockChangeDeliveryDate).toHaveBeenCalledWith(1, '2026-05-01');
      });
    });

    it('変更失敗時にエラーメッセージが表示される', async () => {
      mockChangeDeliveryDate.mockResolvedValue({
        success: false,
        reason: '届け日を変更できるのは「注文済み」の受注のみです',
      });

      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          changeDeliveryDate={mockChangeDeliveryDate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('届け日変更')).toBeInTheDocument();
      });

      await userEvent.type(screen.getByLabelText('新しい届け日'), '2026-05-01');
      await userEvent.click(screen.getByRole('button', { name: '届け日を変更する' }));

      await waitFor(() => {
        expect(screen.getByText('届け日を変更できるのは「注文済み」の受注のみです')).toBeInTheDocument();
      });
    });

    it('出荷準備中の場合は届け日変更セクションが表示されない', async () => {
      const shippingOrder: OrderDto = { ...mockOrder, status: '出荷準備中' };
      mockFetchOrder.mockResolvedValue(shippingOrder);

      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          changeDeliveryDate={mockChangeDeliveryDate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('出荷準備中')).toBeInTheDocument();
      });

      expect(screen.queryByText('届け日変更')).not.toBeInTheDocument();
    });
  });
});
