import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { OrderDetailPage } from './OrderDetailPage'
import { vi } from 'vitest'
import { orderAdminApi } from '../../lib/order-admin-api'
import type { OrderResponse } from '../../types/order'

vi.mock('../../lib/order-admin-api', () => ({
  orderAdminApi: {
    findById: vi.fn(),
    acceptOrder: vi.fn(),
    cancelOrder: vi.fn(),
  },
}))

function renderPage(orderId = '1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[`/admin/orders/${orderId}`]}>
          <Routes>
            <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function createMockOrder(overrides: Partial<OrderResponse> = {}): OrderResponse {
  return {
    id: 1,
    customerId: 10,
    productId: 100,
    deliveryDestinationId: 50,
    deliveryDate: '2026-06-01',
    message: null,
    status: 'ORDERED',
    orderedAt: '2026-05-28T10:00:00',
    updatedAt: '2026-05-28T10:00:00',
    productName: '春の花束',
    customerName: '山田太郎',
    recipientName: '田中花子',
    deliveryAddress: '東京都千代田区1-1-1',
    ...overrides,
  }
}

describe('OrderDetailPage - キャンセル機能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ORDERED状態でキャンセルボタンが表示される', async () => {
    vi.mocked(orderAdminApi.findById).mockResolvedValue({
      data: createMockOrder({ status: 'ORDERED' }),
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('キャンセル')).toBeInTheDocument()
    })
  })

  it('ACCEPTED状態でキャンセルボタンが表示される', async () => {
    vi.mocked(orderAdminApi.findById).mockResolvedValue({
      data: createMockOrder({ status: 'ACCEPTED' }),
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
    })
  })

  it('PREPARING状態でキャンセルボタンがdisabledである', async () => {
    vi.mocked(orderAdminApi.findById).mockResolvedValue({
      data: createMockOrder({ status: 'PREPARING' }),
    } as never)

    renderPage()

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
      expect(cancelButton).toBeDisabled()
    })
  })

  it('PREPARING状態でツールチップが表示される', async () => {
    vi.mocked(orderAdminApi.findById).mockResolvedValue({
      data: createMockOrder({ status: 'PREPARING' }),
    } as never)

    renderPage()

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
      expect(cancelButton).toHaveAttribute('title', expect.stringContaining('出荷準備中'))
    })
  })

  it('キャンセルボタンで確認ダイアログが表示される', async () => {
    vi.mocked(orderAdminApi.findById).mockResolvedValue({
      data: createMockOrder({ status: 'ORDERED' }),
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(screen.getByText('キャンセル確認')).toBeInTheDocument()
    expect(screen.getByText(/春の花束/)).toBeInTheDocument()
    expect(screen.getByText(/山田太郎/)).toBeInTheDocument()
    expect(screen.getByText(/在庫引当が解除されます/)).toBeInTheDocument()
  })

  it('確認ダイアログでキャンセルを実行できる', async () => {
    vi.mocked(orderAdminApi.findById).mockResolvedValue({
      data: createMockOrder({ status: 'ORDERED' }),
    } as never)
    vi.mocked(orderAdminApi.cancelOrder).mockResolvedValue({
      data: createMockOrder({ status: 'CANCELLED' }),
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
    await userEvent.click(screen.getByText('キャンセルを実行'))

    await waitFor(() => {
      expect(orderAdminApi.cancelOrder).toHaveBeenCalledWith(1)
    })
  })

  it('SHIPPED状態ではキャンセルボタンがdisabledである', async () => {
    vi.mocked(orderAdminApi.findById).mockResolvedValue({
      data: createMockOrder({ status: 'SHIPPED' }),
    } as never)

    renderPage()

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
      expect(cancelButton).toBeDisabled()
    })
  })
})
