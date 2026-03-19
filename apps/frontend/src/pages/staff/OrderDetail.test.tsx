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
const mockCancelOrder = vi.fn<(orderId: number) => Promise<{ success: boolean; reason?: string }>>();
const mockOnNavigateToStockForecast = vi.fn();

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

    it('在庫不足エラー時に在庫推移画面への導線が表示される', async () => {
      mockChangeDeliveryDate.mockResolvedValue({
        success: false,
        reason: '在庫が不足しています（単品ID: 1、必要: 10、在庫: 5）',
      });

      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          changeDeliveryDate={mockChangeDeliveryDate}
          onNavigateToStockForecast={mockOnNavigateToStockForecast}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('届け日変更')).toBeInTheDocument();
      });

      await userEvent.type(screen.getByLabelText('新しい届け日'), '2026-05-01');
      await userEvent.click(screen.getByRole('button', { name: '届け日を変更する' }));

      await waitFor(() => {
        expect(screen.getByText(/在庫が不足しています/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '在庫推移を確認' })).toBeInTheDocument();
      });
    });
  });

  describe('注文キャンセル', () => {
    beforeEach(() => {
      mockCancelOrder.mockResolvedValue({ success: true });
    });

    it('注文済みの場合、キャンセルボタンが表示される', async () => {
      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          cancelOrder={mockCancelOrder}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      });
    });

    it('出荷準備中の場合、キャンセルボタンが表示されない', async () => {
      mockFetchOrder.mockResolvedValue({ ...mockOrder, status: '出荷準備中' });

      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          cancelOrder={mockCancelOrder}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('出荷準備中')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: 'キャンセル' })).not.toBeInTheDocument();
    });

    it('キャンセルボタンを押すと確認ダイアログが表示される', async () => {
      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          cancelOrder={mockCancelOrder}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }));

      await waitFor(() => {
        expect(screen.getByText('この注文をキャンセルしますか？')).toBeInTheDocument();
        expect(screen.getByText(/この操作は取り消せません/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'はい、キャンセルする' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'いいえ' })).toBeInTheDocument();
      });
    });

    it('確認ダイアログで「はい」を押すとキャンセルが実行される', async () => {
      const cancelledOrder = { ...mockOrder, status: 'キャンセル' };
      mockFetchOrder
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(cancelledOrder);

      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          cancelOrder={mockCancelOrder}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
      await userEvent.click(screen.getByRole('button', { name: 'はい、キャンセルする' }));

      await waitFor(() => {
        expect(mockCancelOrder).toHaveBeenCalledWith(1);
      });
    });

    it('キャンセル後はキャンセルボタンと届け日変更セクションが非表示になる', async () => {
      const cancelledOrder: OrderDto = { ...mockOrder, status: 'キャンセル' };
      mockFetchOrder
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(cancelledOrder);

      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          cancelOrder={mockCancelOrder}
          changeDeliveryDate={mockChangeDeliveryDate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
      await userEvent.click(screen.getByRole('button', { name: 'はい、キャンセルする' }));

      await waitFor(() => {
        expect(screen.getByText('キャンセル')).toBeInTheDocument();
      });

      // キャンセルボタンと届け日変更が非表示
      expect(screen.queryByRole('button', { name: 'キャンセル' })).not.toBeInTheDocument();
      expect(screen.queryByText('届け日変更')).not.toBeInTheDocument();
    });

    it('確認ダイアログで「いいえ」を押すとキャンセルされない', async () => {
      render(
        <OrderDetail
          orderId={1}
          fetchOrder={mockFetchOrder}
          onBack={mockOnBack}
          cancelOrder={mockCancelOrder}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
      await userEvent.click(screen.getByRole('button', { name: 'いいえ' }));

      expect(mockCancelOrder).not.toHaveBeenCalled();
      // ダイアログが閉じる
      expect(screen.queryByText('この注文をキャンセルしますか？')).not.toBeInTheDocument();
    });
  });
});
