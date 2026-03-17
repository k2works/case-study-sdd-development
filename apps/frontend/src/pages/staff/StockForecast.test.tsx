import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StockForecast } from './StockForecast';
import type { StockForecastDto } from '../../types/stock-forecast';
import type { ItemDto } from '../../types/item';

const mockItems: ItemDto[] = [
  { id: 1, name: 'バラ（赤）', qualityRetentionDays: 5, purchaseUnit: 10, leadTimeDays: 2, supplierId: 1 },
  { id: 2, name: 'カスミソウ', qualityRetentionDays: 7, purchaseUnit: 20, leadTimeDays: 3, supplierId: 1 },
];

const mockForecastData: StockForecastDto[] = [
  { date: '2026-04-07', itemId: 1, currentStock: 20, expectedArrival: 0, allocated: 0, expired: 0, availableStock: 20, isShortage: false, isExpiryWarning: false },
  { date: '2026-04-08', itemId: 1, currentStock: 20, expectedArrival: 0, allocated: 5, expired: 0, availableStock: 15, isShortage: false, isExpiryWarning: false },
  { date: '2026-04-09', itemId: 1, currentStock: 20, expectedArrival: 10, allocated: 5, expired: 0, availableStock: 25, isShortage: false, isExpiryWarning: false },
  { date: '2026-04-10', itemId: 1, currentStock: 20, expectedArrival: 10, allocated: 5, expired: 20, availableStock: 5, isShortage: false, isExpiryWarning: true },
  { date: '2026-04-11', itemId: 1, currentStock: 20, expectedArrival: 10, allocated: 10, expired: 20, availableStock: 0, isShortage: true, isExpiryWarning: true },
];

describe('StockForecast', () => {
  const mockFetchItems = vi.fn<() => Promise<ItemDto[]>>();
  const mockFetchForecast = vi.fn<(itemId: number, fromDate: string, toDate: string) => Promise<StockForecastDto[]>>();
  const mockOnPurchaseOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchItems.mockResolvedValue(mockItems);
    mockFetchForecast.mockResolvedValue(mockForecastData);
  });

  it('タイトルが表示される', () => {
    render(
      <StockForecast
        fetchItems={mockFetchItems}
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );
    expect(screen.getByRole('heading', { name: '在庫推移' })).toBeInTheDocument();
  });

  it('単品一覧が読み込まれる', async () => {
    render(
      <StockForecast
        fetchItems={mockFetchItems}
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(mockFetchItems).toHaveBeenCalled();
    });
  });

  it('表示ボタンで在庫推移データを取得する', async () => {
    render(
      <StockForecast
        fetchItems={mockFetchItems}
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('表示')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('表示'));

    await waitFor(() => {
      expect(mockFetchForecast).toHaveBeenCalled();
    });
  });

  it('在庫推移データがテーブルに表示される', async () => {
    render(
      <StockForecast
        fetchItems={mockFetchItems}
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('表示')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('表示'));

    await waitFor(() => {
      expect(screen.getByText('4/7')).toBeInTheDocument();
    });

    // 欠品セル（availableStock <= 0）を確認
    const table = screen.getByRole('table');
    expect(within(table).getByText('0')).toBeInTheDocument();
  });

  it('発注ボタンをクリックすると onPurchaseOrder が呼ばれる', async () => {
    render(
      <StockForecast
        fetchItems={mockFetchItems}
        fetchForecast={mockFetchForecast}
        onPurchaseOrder={mockOnPurchaseOrder}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('表示')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('表示'));

    await waitFor(() => {
      expect(screen.getByText('発注')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('発注'));

    expect(mockOnPurchaseOrder).toHaveBeenCalled();
  });
});
