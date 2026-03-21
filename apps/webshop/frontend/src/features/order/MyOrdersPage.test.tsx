import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { MyOrdersPage } from './MyOrdersPage'
import { vi } from 'vitest'
import { orderApi } from '../../lib/order-api'

vi.mock('../../lib/order-api', () => ({
  orderApi: {
    getMyOrders: vi.fn(),
    placeOrder: vi.fn(),
  },
}))

function renderMyOrdersPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <MyOrdersPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('MyOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('注文履歴ページのタイトルが表示される', () => {
    vi.mocked(orderApi.getMyOrders).mockResolvedValue({ data: [] } as never)
    renderMyOrdersPage()
    expect(screen.getByRole('heading', { name: '注文履歴' })).toBeInTheDocument()
  })

  it('注文がない場合は空状態メッセージが表示される', async () => {
    vi.mocked(orderApi.getMyOrders).mockResolvedValue({ data: [] } as never)
    renderMyOrdersPage()
    await waitFor(() => {
      expect(screen.getByText('まだ注文がありません。')).toBeInTheDocument()
    })
  })

  it('商品カタログへのリンクが表示される', () => {
    vi.mocked(orderApi.getMyOrders).mockResolvedValue({ data: [] } as never)
    renderMyOrdersPage()
    expect(screen.getByRole('link', { name: '商品カタログへ' })).toBeInTheDocument()
  })

  it('注文データが表示される', async () => {
    vi.mocked(orderApi.getMyOrders).mockResolvedValue({
      data: [
        {
          id: 1,
          customerId: 1,
          productId: 1,
          deliveryDestinationId: 1,
          deliveryDate: '2026-04-01',
          message: 'お誕生日おめでとう',
          status: 'ORDERED',
          orderedAt: '2026-03-21T10:00:00',
          updatedAt: '2026-03-21T10:00:00',
          productName: '赤バラのクラシックブーケ',
          customerName: '山田 花子',
          recipientName: '田中 太郎',
          deliveryAddress: '東京都渋谷区1-1-1',
        },
      ],
    } as never)

    renderMyOrdersPage()

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument()
      expect(screen.getByText('赤バラのクラシックブーケ')).toBeInTheDocument()
      expect(screen.getByText('田中 太郎')).toBeInTheDocument()
      expect(screen.getByText('2026-04-01')).toBeInTheDocument()
      expect(screen.getByText('注文受付')).toBeInTheDocument()
    })
  })

  it('複数のステータスが正しくラベル表示される', async () => {
    vi.mocked(orderApi.getMyOrders).mockResolvedValue({
      data: [
        {
          id: 1, customerId: 1, productId: 1, deliveryDestinationId: 1,
          deliveryDate: '2026-04-01', message: null, status: 'ORDERED',
          orderedAt: '2026-03-21T10:00:00', updatedAt: '2026-03-21T10:00:00',
          productName: '商品A', customerName: null, recipientName: '宛先A', deliveryAddress: null,
        },
        {
          id: 2, customerId: 1, productId: 2, deliveryDestinationId: 2,
          deliveryDate: '2026-04-05', message: null, status: 'DELIVERED',
          orderedAt: '2026-03-20T10:00:00', updatedAt: '2026-03-25T10:00:00',
          productName: '商品B', customerName: null, recipientName: '宛先B', deliveryAddress: null,
        },
      ],
    } as never)

    renderMyOrdersPage()

    await waitFor(() => {
      expect(screen.getByText('注文受付')).toBeInTheDocument()
      expect(screen.getByText('届け完了')).toBeInTheDocument()
    })
  })
})
