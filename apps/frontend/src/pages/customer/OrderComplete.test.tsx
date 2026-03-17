import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderComplete } from './OrderComplete';
import type { OrderDto } from '../../types/order';

const mockOrder: OrderDto = {
  id: 42,
  customerId: 1,
  productId: 1,
  price: 5500,
  destination: {
    name: '山田太郎',
    address: '東京都渋谷区1-1-1',
    phone: '03-1234-5678',
  },
  deliveryDate: '2026-04-01',
  shippingDate: '2026-03-30',
  message: 'お誕生日おめでとう',
  status: '注文済み',
};

const mockOnTop = vi.fn();

describe('OrderComplete', () => {
  it('注文完了メッセージが表示される', () => {
    render(
      <OrderComplete
        order={mockOrder}
        productName="ローズブーケ"
        onTop={mockOnTop}
      />,
    );

    expect(screen.getByText('注文が完了しました')).toBeInTheDocument();
  });

  it('注文番号が表示される', () => {
    render(
      <OrderComplete
        order={mockOrder}
        productName="ローズブーケ"
        onTop={mockOnTop}
      />,
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('商品名が表示される', () => {
    render(
      <OrderComplete
        order={mockOrder}
        productName="ローズブーケ"
        onTop={mockOnTop}
      />,
    );

    expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
  });

  it('価格が表示される', () => {
    render(
      <OrderComplete
        order={mockOrder}
        productName="ローズブーケ"
        onTop={mockOnTop}
      />,
    );

    expect(screen.getByText('¥5,500（税込）')).toBeInTheDocument();
  });

  it('届け日が表示される', () => {
    render(
      <OrderComplete
        order={mockOrder}
        productName="ローズブーケ"
        onTop={mockOnTop}
      />,
    );

    expect(screen.getByText('2026-04-01')).toBeInTheDocument();
  });

  it('届け先情報が表示される', () => {
    render(
      <OrderComplete
        order={mockOrder}
        productName="ローズブーケ"
        onTop={mockOnTop}
      />,
    );

    expect(screen.getByText('山田太郎')).toBeInTheDocument();
    expect(screen.getByText('東京都渋谷区1-1-1')).toBeInTheDocument();
    expect(screen.getByText('03-1234-5678')).toBeInTheDocument();
  });

  it('トップページに戻るボタンが存在する', () => {
    render(
      <OrderComplete
        order={mockOrder}
        productName="ローズブーケ"
        onTop={mockOnTop}
      />,
    );

    expect(screen.getByRole('button', { name: 'トップページに戻る' })).toBeInTheDocument();
  });

  it('トップページに戻るボタンを押すと onTop が呼ばれる', async () => {
    render(
      <OrderComplete
        order={mockOrder}
        productName="ローズブーケ"
        onTop={mockOnTop}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'トップページに戻る' }));
    expect(mockOnTop).toHaveBeenCalled();
  });
});
