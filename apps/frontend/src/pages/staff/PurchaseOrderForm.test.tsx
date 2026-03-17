import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurchaseOrderForm } from './PurchaseOrderForm';
import type { ItemDto } from '../../types/item';
import type { PurchaseOrderDto, CreatePurchaseOrderInput } from '../../types/purchase-order';

const mockItem: ItemDto = {
  id: 1,
  name: 'バラ（赤）',
  qualityRetentionDays: 5,
  purchaseUnit: 10,
  leadTimeDays: 2,
  supplierId: 1,
};

const mockCreatedOrder: PurchaseOrderDto = {
  id: 1,
  itemId: 1,
  supplierId: 1,
  quantity: 30,
  orderDate: '2026-04-07',
  expectedArrivalDate: '2026-04-09',
  status: '発注済み',
};

describe('PurchaseOrderForm', () => {
  const mockCreatePurchaseOrder = vi.fn<(input: CreatePurchaseOrderInput) => Promise<PurchaseOrderDto>>();
  const mockOnBack = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreatePurchaseOrder.mockResolvedValue(mockCreatedOrder);
  });

  it('単品情報が表示される', () => {
    render(
      <PurchaseOrderForm
        item={mockItem}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onComplete={mockOnComplete}
      />,
    );

    expect(screen.getByRole('heading', { name: '発注' })).toBeInTheDocument();
    expect(screen.getByText('バラ（赤）')).toBeInTheDocument();
    expect(screen.getByText('10本')).toBeInTheDocument();
    expect(screen.getByText('2日')).toBeInTheDocument();
  });

  it('発注数量を入力すると購入単位の倍数に自動調整される', async () => {
    render(
      <PurchaseOrderForm
        item={mockItem}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onComplete={mockOnComplete}
      />,
    );

    const input = screen.getByLabelText('発注数量');
    await userEvent.clear(input);
    await userEvent.type(input, '25');

    expect(screen.getByText('30本（購入単位: 10本の倍数）')).toBeInTheDocument();
  });

  it('発注を確定するとAPIが呼ばれ完了コールバックが実行される', async () => {
    render(
      <PurchaseOrderForm
        item={mockItem}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onComplete={mockOnComplete}
      />,
    );

    const input = screen.getByLabelText('発注数量');
    await userEvent.clear(input);
    await userEvent.type(input, '25');

    await userEvent.click(screen.getByText('発注する'));

    await waitFor(() => {
      expect(mockCreatePurchaseOrder).toHaveBeenCalledWith({
        itemId: 1,
        quantity: 25,
      });
    });

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('戻るボタンで onBack が呼ばれる', async () => {
    render(
      <PurchaseOrderForm
        item={mockItem}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onComplete={mockOnComplete}
      />,
    );

    await userEvent.click(screen.getByText('戻る'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('数量が 0 以下の場合は発注ボタンが無効', () => {
    render(
      <PurchaseOrderForm
        item={mockItem}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onComplete={mockOnComplete}
      />,
    );

    expect(screen.getByText('発注する')).toBeDisabled();
  });
});
