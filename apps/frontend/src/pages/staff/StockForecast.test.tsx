import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StockForecast } from './StockForecast';
import type { StockForecastItem } from '../../types/stock-forecast';

const mockData: StockForecastItem[] = [
  {
    itemId: 1,
    itemName: 'バラ（赤）',
    qualityRetentionDays: 5,
    forecasts: [
      {
        date: '2026-04-07',
        currentStock: 20,
        expectedArrival: 0,
        allocated: 5,
        expired: 0,
        availableStock: 15,
        isShortage: false,
        isExpiryWarning: false,
      },
      {
        date: '2026-04-08',
        currentStock: 20,
        expectedArrival: 0,
        allocated: 15,
        expired: 5,
        availableStock: 0,
        isShortage: true,
        isExpiryWarning: true,
      },
    ],
  },
];

const mockFetchForecast = vi.fn<(fromDate: string, toDate: string, itemId?: number) => Promise<StockForecastItem[]>>();
const mockOnPurchaseOrder = vi.fn();

describe('StockForecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchForecast.mockResolvedValue(mockData);
  });

  it('在庫推移テーブルが表示される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('table', { name: '在庫推移' })).toBeInTheDocument();
    });
  });

  it('欠品警告セルに shortage クラスが付与される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    expect(screen.getByText('0').closest('td')).toHaveClass('shortage');
  });

  it('各セルに内訳ツールチップが付いている', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    expect(screen.getByText('15').closest('td')).toHaveAttribute(
      'title',
      '在庫予定数: 15\n├ 現在庫: 20\n├ 入荷予定: +0\n├ 受注引当: -5\n└ 期限超過: -0',
    );
  });

  it('発注ボタンが表示される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '発注' })).toBeInTheDocument();
    });
  });

  it('onPurchaseOrder 未設定時に発注ボタンが disabled で準備中のツールチップが表示される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '発注' })).toBeDisabled();
    });

    expect(screen.getByRole('button', { name: '発注' })).toHaveAttribute(
      'title',
      '発注機能は準備中です',
    );
  });

  it('期間フィルタの入力欄が表示される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('開始日')).toBeInTheDocument();
      expect(screen.getByLabelText('終了日')).toBeInTheDocument();
    });
  });

  it('日付ヘッダーに曜日が表示される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      // 2026-04-07 は火曜日
      expect(screen.getByRole('columnheader', { name: '04-07(火)' })).toBeInTheDocument();
      // 2026-04-08 は水曜日
      expect(screen.getByRole('columnheader', { name: '04-08(水)' })).toBeInTheDocument();
    });
  });

  it('開始日を変更すると再取得される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('開始日')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const fromInput = screen.getByLabelText('開始日');
    await user.clear(fromInput);
    await user.type(fromInput, '2026-04-10');

    await waitFor(() => {
      expect(mockFetchForecast).toHaveBeenCalledWith('2026-04-10', expect.any(String), undefined);
    });
  });

  it('終了日を変更すると再取得される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('終了日')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const toInput = screen.getByLabelText('終了日');
    await user.clear(toInput);
    await user.type(toInput, '2026-04-20');

    await waitFor(() => {
      expect(mockFetchForecast).toHaveBeenCalledWith(expect.any(String), '2026-04-20', undefined);
    });
  });

  it('単品フィルタを変更すると再取得される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('単品')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('単品'), '1');

    await waitFor(() => {
      expect(mockFetchForecast).toHaveBeenCalledWith(expect.any(String), expect.any(String), 1);
    });
  });

  it('発注ボタンをクリックすると onPurchaseOrder が呼ばれる', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '発注' })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '発注' }));

    expect(mockOnPurchaseOrder).toHaveBeenCalledWith(1);
  });

  it('凡例に欠品警告と品質維持日数超過の説明が表示される', async () => {
    render(
      <StockForecast
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/欠品警告/)).toBeInTheDocument();
      expect(screen.getByText(/品質維持日数超過/)).toBeInTheDocument();
    });
  });
});
