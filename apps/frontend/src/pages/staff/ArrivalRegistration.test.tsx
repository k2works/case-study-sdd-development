import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrivalRegistration } from './ArrivalRegistration';
import type { PurchaseOrderRecord, RegisterArrivalInput, RegisterArrivalResult } from '../../types/arrival';
import type { ItemDto } from '../../types/item';

const mockPurchaseOrders: PurchaseOrderRecord[] = [
  {
    purchaseOrderId: 1,
    itemId: 1,
    supplierId: 10,
    quantity: 100,
    orderDate: '2026-03-15',
    expectedArrivalDate: '2026-03-18',
    status: '発注済み',
  },
  {
    purchaseOrderId: 2,
    itemId: 2,
    supplierId: 10,
    quantity: 50,
    orderDate: '2026-03-16',
    expectedArrivalDate: '2026-03-19',
    status: '発注済み',
  },
];

const mockItems: ItemDto[] = [
  { id: 1, name: '赤バラ', qualityRetentionDays: 7, purchaseUnit: 100, leadTimeDays: 3, supplierId: 10 },
  { id: 2, name: '白ユリ', qualityRetentionDays: 5, purchaseUnit: 50, leadTimeDays: 2, supplierId: 10 },
];

describe('ArrivalRegistration', () => {
  let fetchPurchaseOrders: ReturnType<typeof vi.fn<() => Promise<PurchaseOrderRecord[]>>>;
  let fetchItems: ReturnType<typeof vi.fn<() => Promise<ItemDto[]>>>;
  let registerArrival: ReturnType<typeof vi.fn<(input: RegisterArrivalInput) => Promise<RegisterArrivalResult>>>;
  let onSuccess: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchPurchaseOrders = vi.fn<() => Promise<PurchaseOrderRecord[]>>().mockResolvedValue(mockPurchaseOrders);
    fetchItems = vi.fn<() => Promise<ItemDto[]>>().mockResolvedValue(mockItems);
    registerArrival = vi.fn<(input: RegisterArrivalInput) => Promise<RegisterArrivalResult>>().mockResolvedValue({
      arrivalId: 1,
      itemId: 1,
      purchaseOrderId: 1,
      quantity: 100,
      arrivalDate: '2026-03-18',
      status: '入荷済み',
    });
    onSuccess = vi.fn();
  });

  const renderComponent = () =>
    render(
      <ArrivalRegistration
        fetchPurchaseOrders={fetchPurchaseOrders}
        fetchItems={fetchItems}
        registerArrival={registerArrival}
        onSuccess={onSuccess}
      />,
    );

  it('発注済み一覧が表示される', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
      expect(screen.getByText('白ユリ')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: '入荷登録' })).toHaveLength(2);
  });

  it('入荷登録ボタンで入荷フォームが表示される', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button', { name: '入荷登録' });
    await user.click(buttons[0]);

    expect(screen.getByLabelText('入荷数量')).toBeInTheDocument();
    expect(screen.getByLabelText('入荷日')).toBeInTheDocument();
  });

  it('入荷数量がデフォルトで発注数量になる', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button', { name: '入荷登録' });
    await user.click(buttons[0]);

    const quantityInput = screen.getByLabelText('入荷数量') as HTMLInputElement;
    expect(quantityInput.value).toBe('100');
  });

  it('入荷登録を実行できる', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button', { name: '入荷登録' });
    await user.click(buttons[0]);

    await user.click(screen.getByRole('button', { name: '登録する' }));

    await waitFor(() => {
      expect(registerArrival).toHaveBeenCalledWith({
        purchaseOrderId: 1,
        quantity: 100,
        arrivalDate: expect.any(String),
      });
    });
  });

  it('登録成功後に onSuccess が呼ばれる', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button', { name: '入荷登録' });
    await user.click(buttons[0]);
    await user.click(screen.getByRole('button', { name: '登録する' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('発注済みがゼロ件の場合メッセージが表示される', async () => {
    fetchPurchaseOrders.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('発注済みの発注はありません。')).toBeInTheDocument();
    });
  });

  it('API エラー時にエラーメッセージが表示される', async () => {
    registerArrival.mockRejectedValue(new Error('入荷数量は発注数量と一致する必要があります'));
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button', { name: '入荷登録' });
    await user.click(buttons[0]);
    await user.click(screen.getByRole('button', { name: '登録する' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('キャンセルで一覧に戻る', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button', { name: '入荷登録' });
    await user.click(buttons[0]);

    expect(screen.getByLabelText('入荷数量')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    await waitFor(() => {
      expect(screen.queryByLabelText('入荷数量')).not.toBeInTheDocument();
    });
  });
});
