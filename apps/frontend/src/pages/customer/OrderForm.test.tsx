import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderForm } from './OrderForm';
import type { CustomerDto } from '../../types/customer';
import type { OrderDestination } from '../../types/order';

const mockProduct = {
  id: 1,
  name: 'ローズブーケ',
  price: 5500,
};

const mockOnBack = vi.fn();
const mockOnConfirm = vi.fn();

const mockCustomers: CustomerDto[] = [
  { customerId: 1, name: '山田花店', phone: '03-1111-1111', email: null },
  { customerId: 2, name: '鈴木花店', phone: '03-2222-2222', email: null },
];

const mockOrderDestinations: OrderDestination[] = [
  { name: '田中太郎', address: '東京都渋谷区1-1-1', phone: '03-3333-3333' },
  { name: '鈴木花子', address: '大阪府大阪市2-2-2', phone: '06-4444-4444' },
];

const mockFetchCustomers = vi.fn<() => Promise<CustomerDto[]>>();
const mockFetchOrderDestinations = vi.fn<(customerId: number) => Promise<OrderDestination[]>>();

describe('OrderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('選択商品の情報が表示される', () => {
    render(
      <OrderForm
        product={mockProduct}
        onBack={mockOnBack}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
    expect(screen.getByText('¥5,500（税込）')).toBeInTheDocument();
  });

  it('入力フォームが表示される', () => {
    render(
      <OrderForm
        product={mockProduct}
        onBack={mockOnBack}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByLabelText('届け日')).toBeInTheDocument();
    expect(screen.getByLabelText('届け先名')).toBeInTheDocument();
    expect(screen.getByLabelText('届け先住所')).toBeInTheDocument();
    expect(screen.getByLabelText('届け先電話番号')).toBeInTheDocument();
    expect(screen.getByLabelText('お届けメッセージ')).toBeInTheDocument();
  });

  it('戻るボタンが存在する', () => {
    render(
      <OrderForm
        product={mockProduct}
        onBack={mockOnBack}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
  });

  it('確認画面へボタンが存在する', () => {
    render(
      <OrderForm
        product={mockProduct}
        onBack={mockOnBack}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByRole('button', { name: '確認画面へ' })).toBeInTheDocument();
  });

  it('戻るボタンを押すと onBack が呼ばれる', async () => {
    render(
      <OrderForm
        product={mockProduct}
        onBack={mockOnBack}
        onConfirm={mockOnConfirm}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '戻る' }));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('フォーム入力後に確認画面へボタンを押すと onConfirm が呼ばれる', async () => {
    render(
      <OrderForm
        product={mockProduct}
        onBack={mockOnBack}
        onConfirm={mockOnConfirm}
      />,
    );

    // 翌々日以降の日付を設定
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];

    await userEvent.type(screen.getByLabelText('届け日'), dateStr);
    await userEvent.type(screen.getByLabelText('届け先名'), '山田太郎');
    await userEvent.type(screen.getByLabelText('届け先住所'), '東京都渋谷区1-1-1');
    await userEvent.type(screen.getByLabelText('届け先電話番号'), '03-1234-5678');
    await userEvent.type(screen.getByLabelText('お届けメッセージ'), 'お誕生日おめでとう');

    await userEvent.click(screen.getByRole('button', { name: '確認画面へ' }));

    expect(mockOnConfirm).toHaveBeenCalledWith({
      deliveryDate: dateStr,
      destinationName: '山田太郎',
      destinationAddress: '東京都渋谷区1-1-1',
      destinationPhone: '03-1234-5678',
      message: 'お誕生日おめでとう',
    });
  });

  it('届け日の最小値は翌々日である', () => {
    render(
      <OrderForm
        product={mockProduct}
        onBack={mockOnBack}
        onConfirm={mockOnConfirm}
      />,
    );

    const dateInput = screen.getByLabelText('届け日') as HTMLInputElement;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    expect(dateInput.min).toBe(minDate.toISOString().split('T')[0]);
  });

  describe('過去の届け先からコピー', () => {
    beforeEach(() => {
      mockFetchCustomers.mockResolvedValue(mockCustomers);
      mockFetchOrderDestinations.mockResolvedValue(mockOrderDestinations);
    });

    it('得意先セレクトボックスが表示される', async () => {
      render(
        <OrderForm
          product={mockProduct}
          onBack={mockOnBack}
          onConfirm={mockOnConfirm}
          fetchCustomers={mockFetchCustomers}
          fetchOrderDestinations={mockFetchOrderDestinations}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText('得意先を選択')).toBeInTheDocument();
      });
    });

    it('得意先を選択すると届け先一覧が表示される', async () => {
      render(
        <OrderForm
          product={mockProduct}
          onBack={mockOnBack}
          onConfirm={mockOnConfirm}
          fetchCustomers={mockFetchCustomers}
          fetchOrderDestinations={mockFetchOrderDestinations}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText('得意先を選択')).toBeInTheDocument();
      });

      await userEvent.selectOptions(screen.getByLabelText('得意先を選択'), '1');

      await waitFor(() => {
        expect(mockFetchOrderDestinations).toHaveBeenCalledWith(1);
        expect(screen.getByText('田中太郎 - 東京都渋谷区1-1-1')).toBeInTheDocument();
      });
    });

    it('届け先を選択するとフォームに自動入力される', async () => {
      render(
        <OrderForm
          product={mockProduct}
          onBack={mockOnBack}
          onConfirm={mockOnConfirm}
          fetchCustomers={mockFetchCustomers}
          fetchOrderDestinations={mockFetchOrderDestinations}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText('得意先を選択')).toBeInTheDocument();
      });

      await userEvent.selectOptions(screen.getByLabelText('得意先を選択'), '1');

      await waitFor(() => {
        expect(screen.getByText('田中太郎 - 東京都渋谷区1-1-1')).toBeInTheDocument();
      });

      await userEvent.selectOptions(screen.getByLabelText('届け先を選択'), '0');

      expect(screen.getByLabelText('届け先名')).toHaveValue('田中太郎');
      expect(screen.getByLabelText('届け先住所')).toHaveValue('東京都渋谷区1-1-1');
      expect(screen.getByLabelText('届け先電話番号')).toHaveValue('03-3333-3333');
    });
  });
});
