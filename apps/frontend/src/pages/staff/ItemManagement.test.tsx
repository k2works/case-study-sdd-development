import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemManagement } from './ItemManagement';
import type { ItemDto } from '../../types/item';

const mockItems: ItemDto[] = [
  { id: 1, name: '赤バラ', qualityRetentionDays: 7, purchaseUnit: 100, leadTimeDays: 3, supplierId: 1 },
  { id: 2, name: 'カスミソウ', qualityRetentionDays: 14, purchaseUnit: 200, leadTimeDays: 1, supplierId: 1 },
];

const mockFetchItems = vi.fn<() => Promise<ItemDto[]>>();
const mockCreateItem = vi.fn<(input: Omit<ItemDto, 'id'>) => Promise<ItemDto>>();
const mockUpdateItem = vi.fn<(id: number, input: Omit<ItemDto, 'id'>) => Promise<ItemDto>>();

describe('ItemManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchItems.mockResolvedValue(mockItems);
  });

  it('単品一覧が表示される', async () => {
    render(
      <ItemManagement
        fetchItems={mockFetchItems}
        createItem={mockCreateItem}
        updateItem={mockUpdateItem}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
      expect(screen.getByText('カスミソウ')).toBeInTheDocument();
    });
  });

  it('新規登録ボタンでフォームが表示される', async () => {
    render(
      <ItemManagement
        fetchItems={mockFetchItems}
        createItem={mockCreateItem}
        updateItem={mockUpdateItem}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('新規登録'));

    expect(screen.getByLabelText('単品名')).toBeInTheDocument();
  });

  it('新規登録できる', async () => {
    const newItem: ItemDto = {
      id: 3,
      name: '白ユリ',
      qualityRetentionDays: 5,
      purchaseUnit: 50,
      leadTimeDays: 2,
      supplierId: 2,
    };
    mockCreateItem.mockResolvedValue(newItem);
    mockFetchItems.mockResolvedValueOnce(mockItems).mockResolvedValueOnce([...mockItems, newItem]);

    render(
      <ItemManagement
        fetchItems={mockFetchItems}
        createItem={mockCreateItem}
        updateItem={mockUpdateItem}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('新規登録'));

    await userEvent.clear(screen.getByLabelText('単品名'));
    await userEvent.type(screen.getByLabelText('単品名'), '白ユリ');
    await userEvent.clear(screen.getByLabelText('品質維持可能日数'));
    await userEvent.type(screen.getByLabelText('品質維持可能日数'), '5');
    await userEvent.clear(screen.getByLabelText('購入単位'));
    await userEvent.type(screen.getByLabelText('購入単位'), '50');
    await userEvent.clear(screen.getByLabelText('発注リードタイム'));
    await userEvent.type(screen.getByLabelText('発注リードタイム'), '2');
    await userEvent.clear(screen.getByLabelText('仕入先ID'));
    await userEvent.type(screen.getByLabelText('仕入先ID'), '2');

    await userEvent.click(screen.getByText('保存する'));

    await waitFor(() => {
      expect(mockCreateItem).toHaveBeenCalledWith({
        name: '白ユリ',
        qualityRetentionDays: 5,
        purchaseUnit: 50,
        leadTimeDays: 2,
        supplierId: 2,
      });
    });
  });

  it('編集ボタンで既存データがフォームに表示される', async () => {
    render(
      <ItemManagement
        fetchItems={mockFetchItems}
        createItem={mockCreateItem}
        updateItem={mockUpdateItem}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('赤バラ')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('編集');
    await userEvent.click(editButtons[0]);

    expect(screen.getByLabelText('単品名')).toHaveValue('赤バラ');
    expect(screen.getByLabelText('品質維持可能日数')).toHaveValue(7);
  });
});
