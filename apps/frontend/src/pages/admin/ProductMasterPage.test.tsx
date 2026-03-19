import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductMasterPage } from './ProductMasterPage'
import * as api from '../../api/products'

vi.mock('../../api/products')

const sampleProducts = [
  { id: 1, name: 'バラの花束', price: 3000, compositions: [{ itemId: 1, quantity: 3 }], isActive: true },
]

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  )
}

describe('ProductMasterPage', () => {
  beforeEach(() => {
    vi.mocked(api.productsApi.getAll).mockResolvedValue(sampleProducts)
  })

  it('商品一覧が表示される', async () => {
    render(<ProductMasterPage />, { wrapper })
    await waitFor(() => expect(screen.getByText('バラの花束')).toBeInTheDocument())
    expect(screen.getByText('¥3,000')).toBeInTheDocument()
  })

  it('新規登録ボタンでフォームが表示される', async () => {
    render(<ProductMasterPage />, { wrapper })
    await waitFor(() => screen.getByText('バラの花束'))
    await userEvent.click(screen.getByRole('button', { name: '新規登録' }))
    expect(screen.getByRole('textbox', { name: '商品名' })).toBeInTheDocument()
  })

  it('削除ボタンで delete API が呼ばれる', async () => {
    vi.mocked(api.productsApi.delete).mockResolvedValue(undefined)
    render(<ProductMasterPage />, { wrapper })
    await waitFor(() => screen.getByText('バラの花束'))
    await userEvent.click(screen.getByRole('button', { name: '削除' }))
    expect(api.productsApi.delete).toHaveBeenCalledWith(1)
  })
})
