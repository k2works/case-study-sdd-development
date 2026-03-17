import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderForm } from './OrderForm';

const mockProduct = {
  id: 1,
  name: 'ローズブーケ',
  price: 5500,
};

const mockOnBack = vi.fn();
const mockOnConfirm = vi.fn();

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
});
