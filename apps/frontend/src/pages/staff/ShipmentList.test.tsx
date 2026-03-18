import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShipmentList } from './ShipmentList';
import type { ShipmentResult } from '../../types/shipment';

const mockResult: ShipmentResult = {
  targets: [
    {
      orderId: 1,
      customerId: 1,
      productId: 1,
      productName: 'ローズブーケ',
      destinationName: '山田花子',
      destinationAddress: '渋谷区',
      materials: [
        { itemId: 1, itemName: '赤バラ', quantity: 5 },
        { itemId: 2, itemName: 'カスミソウ', quantity: 3 },
      ],
    },
  ],
  totalMaterials: [
    { itemId: 1, itemName: '赤バラ', quantity: 5 },
    { itemId: 2, itemName: 'カスミソウ', quantity: 3 },
  ],
};

describe('ShipmentList', () => {
  let fetchShipments: ReturnType<typeof vi.fn<(shippingDate: string) => Promise<ShipmentResult>>>;
  let recordShipment: ReturnType<typeof vi.fn<(orderId: number) => Promise<void>>>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchShipments = vi.fn<(shippingDate: string) => Promise<ShipmentResult>>().mockResolvedValue(mockResult);
    recordShipment = vi.fn<(orderId: number) => Promise<void>>().mockResolvedValue(undefined);
  });

  const renderComponent = () =>
    render(
      <ShipmentList
        fetchShipments={fetchShipments}
        recordShipment={recordShipment}
      />,
    );

  it('出荷日で検索すると出荷対象が表示される', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: '表示' }));

    await waitFor(() => {
      expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      expect(screen.getByText('山田花子(渋谷区)')).toBeInTheDocument();
    });
  });

  it('花材一覧が表示される', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: '表示' }));

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
      expect(screen.getByText('カスミソウ')).toBeInTheDocument();
    });
  });

  it('出荷ボタンで出荷を記録できる', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: '表示' }));

    await waitFor(() => {
      expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '出荷' }));

    await waitFor(() => {
      expect(recordShipment).toHaveBeenCalledWith(1);
    });
  });

  it('出荷対象がない場合メッセージが表示される', async () => {
    fetchShipments.mockResolvedValue({ targets: [], totalMaterials: [] });
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: '表示' }));

    await waitFor(() => {
      expect(screen.getByText('該当日の出荷対象はありません。')).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    recordShipment.mockRejectedValue(new Error('出荷に失敗しました'));
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: '表示' }));

    await waitFor(() => {
      expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '出荷' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
