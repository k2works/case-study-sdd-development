import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

let fetchMock: Mock;

const mockProducts = [
  { id: 1, name: 'ローズブーケ', price: 5500, compositions: [{ itemId: 1, quantity: 5 }] },
];

const mockItems = [
  { id: 1, name: '赤バラ', qualityRetentionDays: 7, purchaseUnit: 100, leadTimeDays: 3, supplierId: 1 },
];

const mockOrder = {
  id: 100,
  customerId: 1,
  productId: 1,
  productName: 'ローズブーケ',
  price: 5500,
  destination: { name: '山田太郎', address: '東京都渋谷区1-1', phone: '03-1234-5678' },
  deliveryDate: '2026-04-01',
  shippingDate: '2026-03-30',
  message: 'お誕生日おめでとう',
  status: '注文済み',
};

const mockOrders = [mockOrder];

/**
 * URL パターンに基づいてレスポンスを返す fetch mock。
 * App.tsx は複数の API エンドポイントを呼び出すため、
 * 順序依存の mockResolvedValueOnce ではなく URL ルーティングで対応する。
 */
function setupFetchMock(overrides?: { createOrder?: unknown }) {
  fetchMock.mockImplementation((url: string, options?: RequestInit) => {
    let data: unknown = [];

    if (typeof url === 'string') {
      if (url.match(/\/api\/orders\/\d+$/)) {
        data = mockOrder;
      } else if (url.includes('/api/orders') && options?.method === 'POST') {
        data = overrides?.createOrder ?? mockOrder;
      } else if (url.includes('/api/orders')) {
        data = mockOrders;
      } else if (url.includes('/api/products')) {
        data = mockProducts;
      } else if (url.includes('/api/items')) {
        data = mockItems;
      }
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    });
  });
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

describe('App', () => {
  it('タイトルが表示される', () => {
    setupFetchMock();
    render(<App />);
    expect(screen.getByText('フレール・メモワール WEB ショップ')).toBeInTheDocument();
  });

  it('メインナビゲーションが表示される', () => {
    setupFetchMock();
    render(<App />);
    expect(screen.getByRole('navigation', { name: 'メインナビゲーション' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' });
    expect(nav.querySelector('button')).toHaveTextContent('花束一覧');
    expect(screen.getByText('管理画面')).toBeInTheDocument();
  });

  it('初期表示は得意先向け花束一覧', () => {
    setupFetchMock();
    render(<App />);
    expect(screen.getByRole('heading', { name: '花束一覧' })).toBeInTheDocument();
  });

  it('管理画面に切り替えるとスタッフ向けタブが表示される', async () => {
    setupFetchMock();
    render(<App />);
    await userEvent.click(screen.getByText('管理画面'));

    expect(screen.getByRole('tablist', { name: '管理メニュー' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '商品管理' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '単品管理' })).toBeInTheDocument();
  });

  it('管理画面に受注管理タブが表示される', async () => {
    setupFetchMock();
    render(<App />);
    await userEvent.click(screen.getByText('管理画面'));

    expect(screen.getByRole('tab', { name: '受注管理' })).toBeInTheDocument();
  });

  describe('注文フロー', () => {
    it('商品一覧から注文フォームに遷移できる', async () => {
      setupFetchMock();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('注文する'));

      expect(screen.getByRole('heading', { name: '注文入力' })).toBeInTheDocument();
      expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
    });

    it('注文フォーム入力後に確認画面に遷移できる', async () => {
      setupFetchMock();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('注文する'));

      await userEvent.type(screen.getByLabelText('届け日'), '2026-04-01');
      await userEvent.type(screen.getByLabelText('届け先名'), '山田太郎');
      await userEvent.type(screen.getByLabelText('届け先住所'), '東京都渋谷区1-1');
      await userEvent.type(screen.getByLabelText('届け先電話番号'), '03-1234-5678');
      await userEvent.type(screen.getByLabelText('お届けメッセージ'), 'お誕生日おめでとう');

      await userEvent.click(screen.getByText('確認画面へ'));

      expect(screen.getByRole('heading', { name: '注文確認' })).toBeInTheDocument();
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('東京都渋谷区1-1')).toBeInTheDocument();
    });

    it('確認画面から修正ボタンで注文フォームに戻れる', async () => {
      setupFetchMock();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('注文する'));
      await userEvent.type(screen.getByLabelText('届け日'), '2026-04-01');
      await userEvent.type(screen.getByLabelText('届け先名'), '山田太郎');
      await userEvent.type(screen.getByLabelText('届け先住所'), '東京都渋谷区1-1');
      await userEvent.type(screen.getByLabelText('届け先電話番号'), '03-1234-5678');
      await userEvent.click(screen.getByText('確認画面へ'));

      expect(screen.getByRole('heading', { name: '注文確認' })).toBeInTheDocument();

      await userEvent.click(screen.getByText('修正する'));

      expect(screen.getByRole('heading', { name: '注文入力' })).toBeInTheDocument();
    });

    it('注文を確定すると完了画面が表示される', async () => {
      setupFetchMock();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('注文する'));
      await userEvent.type(screen.getByLabelText('届け日'), '2026-04-01');
      await userEvent.type(screen.getByLabelText('届け先名'), '山田太郎');
      await userEvent.type(screen.getByLabelText('届け先住所'), '東京都渋谷区1-1');
      await userEvent.type(screen.getByLabelText('届け先電話番号'), '03-1234-5678');
      await userEvent.type(screen.getByLabelText('お届けメッセージ'), 'お誕生日おめでとう');
      await userEvent.click(screen.getByText('確認画面へ'));

      await userEvent.click(screen.getByText('注文を確定する'));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '注文が完了しました' })).toBeInTheDocument();
      });
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('完了画面からトップページに戻ると商品一覧が表示される', async () => {
      setupFetchMock();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('注文する'));
      await userEvent.type(screen.getByLabelText('届け日'), '2026-04-01');
      await userEvent.type(screen.getByLabelText('届け先名'), '山田太郎');
      await userEvent.type(screen.getByLabelText('届け先住所'), '東京都渋谷区1-1');
      await userEvent.type(screen.getByLabelText('届け先電話番号'), '03-1234-5678');
      await userEvent.click(screen.getByText('確認画面へ'));
      await userEvent.click(screen.getByText('注文を確定する'));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '注文が完了しました' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('トップページに戻る'));

      expect(screen.getByRole('heading', { name: '花束一覧' })).toBeInTheDocument();
    });

    it('注文フォームの戻るボタンで商品一覧に戻れる', async () => {
      setupFetchMock();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('注文する'));
      expect(screen.getByRole('heading', { name: '注文入力' })).toBeInTheDocument();

      await userEvent.click(screen.getByText('戻る'));

      expect(screen.getByRole('heading', { name: '花束一覧' })).toBeInTheDocument();
    });
  });

  describe('管理画面タブ切り替え', () => {
    it('単品管理タブに切り替えると単品管理が表示される', async () => {
      setupFetchMock();
      render(<App />);
      await userEvent.click(screen.getByText('管理画面'));

      await userEvent.click(screen.getByRole('tab', { name: '単品管理' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '単品管理' })).toBeInTheDocument();
      });
    });

    it('受注管理タブに切り替えると受注管理が表示される', async () => {
      setupFetchMock();
      render(<App />);
      await userEvent.click(screen.getByText('管理画面'));

      await userEvent.click(screen.getByRole('tab', { name: '受注管理' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '受注管理' })).toBeInTheDocument();
      });
    });

    it('受注一覧の詳細ボタンで受注詳細画面に遷移できる', async () => {
      setupFetchMock();
      render(<App />);
      await userEvent.click(screen.getByText('管理画面'));
      await userEvent.click(screen.getByRole('tab', { name: '受注管理' }));

      await waitFor(() => {
        expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('詳細'));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '受注詳細' })).toBeInTheDocument();
      });
    });

    it('受注詳細画面から戻るボタンで受注一覧に戻れる', async () => {
      setupFetchMock();
      render(<App />);
      await userEvent.click(screen.getByText('管理画面'));
      await userEvent.click(screen.getByRole('tab', { name: '受注管理' }));

      await waitFor(() => {
        expect(screen.getByText('ローズブーケ')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('詳細'));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '受注詳細' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('戻る'));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '受注管理' })).toBeInTheDocument();
      });
    });
  });

  describe('ビュー切り替え', () => {
    it('管理画面から花束一覧に戻ると注文フロー状態がリセットされる', async () => {
      setupFetchMock();
      render(<App />);

      await userEvent.click(screen.getByText('管理画面'));
      expect(screen.getByRole('tablist', { name: '管理メニュー' })).toBeInTheDocument();

      await userEvent.click(screen.getByText('花束一覧'));
      expect(screen.getByRole('heading', { name: '花束一覧' })).toBeInTheDocument();
    });
  });
});
