import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderConfirm } from './OrderConfirm';
import type { OrderFormProduct, OrderFormData } from './OrderForm';

const mockProduct: OrderFormProduct = {
  id: 1,
  name: 'ローズブーケ',
  price: 5500,
};

const mockFormData: OrderFormData = {
  deliveryDate: '2026-04-01',
  destinationName: '山田太郎',
  destinationAddress: '東京都渋谷区1-1-1',
  destinationPhone: '03-1234-5678',
  message: 'お誕生日おめでとう',
};

const mockOnBack = vi.fn();
const mockOnSubmit = vi.fn<() => Promise<void>>();

describe('OrderConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('注文内容が確認表示される', () => {
    render(
      <OrderConfirm
        product={mockProduct}
        formData={mockFormData}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
    expect(screen.getByText('¥5,500（税込）')).toBeInTheDocument();
    expect(screen.getByText('2026-04-01')).toBeInTheDocument();
    expect(screen.getByText('山田太郎')).toBeInTheDocument();
    expect(screen.getByText('東京都渋谷区1-1-1')).toBeInTheDocument();
    expect(screen.getByText('03-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('お誕生日おめでとう')).toBeInTheDocument();
  });

  it('修正するボタンが存在する', () => {
    render(
      <OrderConfirm
        product={mockProduct}
        formData={mockFormData}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByRole('button', { name: '修正する' })).toBeInTheDocument();
  });

  it('注文を確定するボタンが存在する', () => {
    render(
      <OrderConfirm
        product={mockProduct}
        formData={mockFormData}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByRole('button', { name: '注文を確定する' })).toBeInTheDocument();
  });

  it('修正するボタンを押すと onBack が呼ばれる', async () => {
    render(
      <OrderConfirm
        product={mockProduct}
        formData={mockFormData}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '修正する' }));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('注文を確定するボタンを押すと onSubmit が呼ばれる', async () => {
    render(
      <OrderConfirm
        product={mockProduct}
        formData={mockFormData}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '注文を確定する' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('送信中はボタンが無効になる', async () => {
    mockOnSubmit.mockReturnValue(new Promise(() => {})); // never resolves

    render(
      <OrderConfirm
        product={mockProduct}
        formData={mockFormData}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '注文を確定する' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '送信中...' })).toBeDisabled();
    });
  });

  it('API が失敗した場合にエラーメッセージが表示される', async () => {
    mockOnSubmit.mockRejectedValue(new Error('注文の送信に失敗しました。もう一度お試しください。'));

    render(
      <OrderConfirm
        product={mockProduct}
        formData={mockFormData}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '注文を確定する' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '注文の送信に失敗しました。もう一度お試しください。',
      );
    });
  });

  it('API が失敗した場合にボタンが再度クリック可能になる', async () => {
    mockOnSubmit.mockRejectedValue(new Error('エラー'));

    render(
      <OrderConfirm
        product={mockProduct}
        formData={mockFormData}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '注文を確定する' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '注文を確定する' })).toBeEnabled();
    });
  });

  it('在庫不足エラーの場合にバックエンドのメッセージが表示される', async () => {
    mockOnSubmit.mockRejectedValue(new Error('在庫が不足しています'));

    render(
      <OrderConfirm
        product={mockProduct}
        formData={mockFormData}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '注文を確定する' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('在庫が不足しています');
    });
  });
});
