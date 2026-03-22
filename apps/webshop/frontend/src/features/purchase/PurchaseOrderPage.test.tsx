import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { PurchaseOrderPage } from './PurchaseOrderPage'
import { vi } from 'vitest'
import { itemApi } from '../../lib/item-api'
import { purchaseOrderApi } from '../../lib/purchase-order-api'

vi.mock('../../lib/item-api', () => ({
  itemApi: {
    findAll: vi.fn(),
  },
}))

vi.mock('../../lib/purchase-order-api', () => ({
  purchaseOrderApi: {
    create: vi.fn(),
    getAll: vi.fn(),
  },
}))

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <PurchaseOrderPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('PurchaseOrderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('タイトルが表示される', () => {
    vi.mocked(itemApi.findAll).mockResolvedValue({ data: [] } as never)
    vi.mocked(purchaseOrderApi.getAll).mockResolvedValue({ data: [] } as never)

    renderPage()
    expect(screen.getByText('発注管理')).toBeInTheDocument()
  })

  it('空の発注一覧でガイドメッセージが表示される', async () => {
    vi.mocked(itemApi.findAll).mockResolvedValue({ data: [] } as never)
    vi.mocked(purchaseOrderApi.getAll).mockResolvedValue({ data: [] } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/まだ発注がありません/)).toBeInTheDocument()
    })
  })

  it('発注一覧が表示される', async () => {
    vi.mocked(itemApi.findAll).mockResolvedValue({
      data: [{ id: 1, name: 'バラ', qualityRetentionDays: 7, purchaseUnit: 10, leadTimeDays: 3, supplierName: '花卸A' }],
    } as never)
    vi.mocked(purchaseOrderApi.getAll).mockResolvedValue({
      data: [{
        id: 1,
        itemId: 1,
        supplierName: '花卸A',
        quantity: 20,
        desiredDeliveryDate: '2026-05-10',
        status: 'ORDERED',
        orderedAt: '2026-05-05T10:00:00',
      }],
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('花卸A')).toBeInTheDocument()
      expect(screen.getAllByText('発注済み').length).toBeGreaterThanOrEqual(1)
    })
  })
})
