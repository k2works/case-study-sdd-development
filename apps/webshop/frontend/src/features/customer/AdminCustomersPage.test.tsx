import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { AdminCustomersPage } from './AdminCustomersPage'
import { vi } from 'vitest'
import { customerApi } from '../../lib/customer-api'
import type { CustomerResponse } from '../../types/customer'

vi.mock('../../lib/customer-api', () => ({
  customerApi: {
    getCustomers: vi.fn(),
    getCustomerDetail: vi.fn(),
  },
}))

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/customers']}>
          <AdminCustomersPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function createMockCustomer(overrides: Partial<CustomerResponse> = {}): CustomerResponse {
  return {
    id: 1,
    name: '山田太郎',
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    createdAt: '2026-01-15T10:00:00',
    ...overrides,
  }
}

describe('AdminCustomersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ページタイトル「得意先管理」が表示される', async () => {
    vi.mocked(customerApi.getCustomers).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('得意先管理')).toBeInTheDocument()
    })
  })

  it('得意先データがテーブルに表示される', async () => {
    const customers = [
      createMockCustomer({ id: 1, name: '山田太郎', email: 'yamada@example.com', phone: '090-1234-5678' }),
      createMockCustomer({ id: 2, name: '田中花子', email: 'tanaka@example.com', phone: null }),
    ]
    vi.mocked(customerApi.getCustomers).mockResolvedValue(customers)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument()
    })
    expect(screen.getByText('yamada@example.com')).toBeInTheDocument()
    expect(screen.getByText('090-1234-5678')).toBeInTheDocument()
    expect(screen.getByText('田中花子')).toBeInTheDocument()
    expect(screen.getByText('tanaka@example.com')).toBeInTheDocument()
  })

  it('検索入力で API が呼ばれる', async () => {
    vi.mocked(customerApi.getCustomers).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('得意先管理')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('得意先名で検索')
    await userEvent.type(searchInput, '山田')
    await userEvent.click(screen.getByRole('button', { name: '検索' }))

    await waitFor(() => {
      expect(customerApi.getCustomers).toHaveBeenCalledWith('山田')
    })
  })

  it('得意先がない場合は空状態メッセージが表示される', async () => {
    vi.mocked(customerApi.getCustomers).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('条件に一致する得意先はありません。')).toBeInTheDocument()
    })
  })

  it('詳細リンクが表示される', async () => {
    const customers = [createMockCustomer({ id: 1 })]
    vi.mocked(customerApi.getCustomers).mockResolvedValue(customers)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('詳細')).toBeInTheDocument()
    })
    const detailLink = screen.getByRole('link', { name: '詳細' })
    expect(detailLink).toHaveAttribute('href', '/admin/customers/1')
  })
})
