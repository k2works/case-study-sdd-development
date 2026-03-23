import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { AdminCustomerDetailPage } from './AdminCustomerDetailPage'
import { vi } from 'vitest'
import { customerApi } from '../../lib/customer-api'
import type { CustomerDetailResponse } from '../../types/customer'

vi.mock('../../lib/customer-api', () => ({
  customerApi: {
    getCustomers: vi.fn(),
    getCustomerDetail: vi.fn(),
  },
}))

function renderPage(customerId = '1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[`/admin/customers/${customerId}`]}>
          <Routes>
            <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function createMockDetail(overrides: Partial<CustomerDetailResponse> = {}): CustomerDetailResponse {
  return {
    id: 1,
    name: '山田太郎',
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    createdAt: '2026-01-15T10:00:00',
    orders: [
      {
        id: 101,
        productName: '春の花束',
        deliveryDate: '2026-03-01',
        status: 'DELIVERED',
        orderedAt: '2026-02-20T09:00:00',
      },
    ],
    ...overrides,
  }
}

describe('AdminCustomerDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('得意先の基本情報が表示される', async () => {
    vi.mocked(customerApi.getCustomerDetail).mockResolvedValue(createMockDetail())

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument()
    })
    expect(screen.getByText('yamada@example.com')).toBeInTheDocument()
    expect(screen.getByText('090-1234-5678')).toBeInTheDocument()
  })

  it('注文履歴テーブルが表示される', async () => {
    vi.mocked(customerApi.getCustomerDetail).mockResolvedValue(createMockDetail())

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('春の花束')).toBeInTheDocument()
    })
    expect(screen.getByText('2026-03-01')).toBeInTheDocument()
    expect(screen.getByText('DELIVERED')).toBeInTheDocument()
  })

  it('注文履歴がない場合はメッセージが表示される', async () => {
    vi.mocked(customerApi.getCustomerDetail).mockResolvedValue(
      createMockDetail({ orders: [] })
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('まだ注文履歴がありません。')).toBeInTheDocument()
    })
  })

  it('得意先一覧への戻るリンクが表示される', async () => {
    vi.mocked(customerApi.getCustomerDetail).mockResolvedValue(createMockDetail())

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('← 得意先一覧に戻る')).toBeInTheDocument()
    })
    const backLink = screen.getByRole('link', { name: '← 得意先一覧に戻る' })
    expect(backLink).toHaveAttribute('href', '/admin/customers')
  })
})
