import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurchaseOrderForm } from './PurchaseOrderForm';
import type { ItemInfo, PurchaseOrderResult } from '../../types/purchase-order';

const mockItemInfo: ItemInfo = {
  itemId: 1,
  itemName: '赤バラ',
  purchaseUnit: 10,
  leadTimeDays: 3,
  supplierId: 2,
  supplierName: '仕入先 2',
};

const mockResult: PurchaseOrderResult = {
  purchaseOrderId: 1,
  itemId: 1,
  supplierId: 2,
  quantity: 10,
  orderDate: '2026-03-18T00:00:00.000Z',
  expectedArrivalDate: '2026-03-21T00:00:00.000Z',
  status: '発注済み',
};

const mockFetchItemInfo = vi.fn<(itemId: number) => Promise<ItemInfo>>();
const mockCreatePurchaseOrder = vi.fn<(input: { itemId: number; quantity: number }) => Promise<PurchaseOrderResult>>();
const mockOnBack = vi.fn();
const mockOnSuccess = vi.fn();

function formatExpectedArrivalDate(leadTimeDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + leadTimeDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

describe('PurchaseOrderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchItemInfo.mockResolvedValue(mockItemInfo);
    mockCreatePurchaseOrder.mockResolvedValue(mockResult);
  });

  it('単品情報が表示される', async () => {
    render(
      <PurchaseOrderForm
        itemId={1}
        fetchItemInfo={mockFetchItemInfo}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    expect(screen.getByText('仕入先 2')).toBeInTheDocument();
    expect(screen.getByText('10 本')).toBeInTheDocument();
    expect(screen.getByText('3 日')).toBeInTheDocument();
  });

  it('数量を入力すると自動調整後の数量が表示される', async () => {
    render(
      <PurchaseOrderForm
        itemId={1}
        fetchItemInfo={mockFetchItemInfo}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('発注数量')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('発注数量'), '7');

    expect(screen.getByText('自動調整後: 10 本（購入単位: 10 本の倍数）')).toBeInTheDocument();
  });

  it('入荷予定日が表示される', async () => {
    render(
      <PurchaseOrderForm
        itemId={1}
        fetchItemInfo={mockFetchItemInfo}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(`入荷予定日: ${formatExpectedArrivalDate(3)}（リードタイム: 3 日）`),
      ).toBeInTheDocument();
    });
  });

  it('発注するボタンをクリックすると createPurchaseOrder が呼ばれる', async () => {
    render(
      <PurchaseOrderForm
        itemId={1}
        fetchItemInfo={mockFetchItemInfo}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('発注数量')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('発注数量'), '7');
    await user.click(screen.getByRole('button', { name: '発注する' }));

    await waitFor(() => {
      expect(mockCreatePurchaseOrder).toHaveBeenCalledWith({ itemId: 1, quantity: 10 });
    });
    expect(mockOnSuccess).toHaveBeenCalledWith(mockResult);
  });

  it('戻るボタンをクリックすると onBack が呼ばれる', async () => {
    render(
      <PurchaseOrderForm
        itemId={1}
        fetchItemInfo={mockFetchItemInfo}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '戻る' }));

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('発注中は発注するボタンが disabled になる', async () => {
    let resolveOrder: ((value: PurchaseOrderResult) => void) | undefined;
    mockCreatePurchaseOrder.mockImplementation(
      () =>
        new Promise<PurchaseOrderResult>((resolve) => {
          resolveOrder = resolve;
        }),
    );

    render(
      <PurchaseOrderForm
        itemId={1}
        fetchItemInfo={mockFetchItemInfo}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('発注数量')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('発注数量'), '7');
    await user.click(screen.getByRole('button', { name: '発注する' }));

    expect(screen.getByRole('button', { name: '発注する' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '戻る' })).toBeDisabled();

    resolveOrder?.(mockResult);
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  it('数量が未入力の場合は発注するボタンが disabled になる', async () => {
    render(
      <PurchaseOrderForm
        itemId={1}
        fetchItemInfo={mockFetchItemInfo}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '発注する' })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '発注する' })).toBeDisabled();
  });

  it('単品情報の取得に失敗するとエラーメッセージが表示される', async () => {
    mockFetchItemInfo.mockRejectedValue(new Error('Network error'));

    render(
      <PurchaseOrderForm
        itemId={1}
        fetchItemInfo={mockFetchItemInfo}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('単品情報の取得に失敗しました。');
    });
  });

  it('発注に失敗するとエラーメッセージが表示される', async () => {
    mockCreatePurchaseOrder.mockRejectedValue(new Error('Server error'));

    render(
      <PurchaseOrderForm
        itemId={1}
        fetchItemInfo={mockFetchItemInfo}
        createPurchaseOrder={mockCreatePurchaseOrder}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('発注数量')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('発注数量'), '7');
    await user.click(screen.getByRole('button', { name: '発注する' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('発注に失敗しました。再度お試しください。');
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
