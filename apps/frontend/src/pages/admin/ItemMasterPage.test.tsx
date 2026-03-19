import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ItemMasterPage } from './ItemMasterPage'
import * as api from '../../api/items'

vi.mock('../../api/items')

const sampleItems = [
  { id: 1, name: 'バラ（赤）', supplierId: 1, shelfLife: 7, isActive: true },
]

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  )
}

describe('ItemMasterPage', () => {
  beforeEach(() => {
    vi.mocked(api.itemsApi.getAll).mockResolvedValue(sampleItems)
  })

  it('単品一覧が表示される', async () => {
    render(<ItemMasterPage />, { wrapper })
    await waitFor(() => expect(screen.getByText('バラ（赤）')).toBeInTheDocument())
    expect(screen.getByText('7日')).toBeInTheDocument()
  })

  it('新規登録ボタンでフォームが表示される', async () => {
    render(<ItemMasterPage />, { wrapper })
    await waitFor(() => screen.getByText('バラ（赤）'))
    await userEvent.click(screen.getByRole('button', { name: '新規登録' }))
    expect(screen.getByRole('textbox', { name: '単品名' })).toBeInTheDocument()
  })

  it('削除ボタンで delete API が呼ばれる', async () => {
    vi.mocked(api.itemsApi.delete).mockResolvedValue(undefined)
    render(<ItemMasterPage />, { wrapper })
    await waitFor(() => screen.getByText('バラ（赤）'))
    await userEvent.click(screen.getByRole('button', { name: '削除' }))
    expect(api.itemsApi.delete).toHaveBeenCalledWith(1)
  })
})
