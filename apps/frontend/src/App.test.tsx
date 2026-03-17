import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
));

describe('App', () => {
  it('タイトルが表示される', () => {
    render(<App />);
    expect(screen.getByText('フレール・メモワール WEB ショップ')).toBeInTheDocument();
  });

  it('メインナビゲーションが表示される', () => {
    render(<App />);
    expect(screen.getByRole('navigation', { name: 'メインナビゲーション' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' });
    expect(nav.querySelector('button')).toHaveTextContent('花束一覧');
    expect(screen.getByText('管理画面')).toBeInTheDocument();
  });

  it('初期表示は得意先向け花束一覧', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '花束一覧' })).toBeInTheDocument();
  });

  it('管理画面に切り替えるとスタッフ向けタブが表示される', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('管理画面'));

    expect(screen.getByRole('tablist', { name: '管理メニュー' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '商品管理' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '単品管理' })).toBeInTheDocument();
  });

  it('管理画面に受注管理タブが表示される', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('管理画面'));

    expect(screen.getByRole('tab', { name: '受注管理' })).toBeInTheDocument();
  });
});
