import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({ json: () => Promise.resolve([]) }),
));

describe('App', () => {
  it('管理画面のタイトルが表示される', () => {
    render(<App />);
    expect(screen.getByText('フレール・メモワール 管理画面')).toBeInTheDocument();
  });
});
