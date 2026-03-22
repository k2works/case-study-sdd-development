import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { ArrivalRegistrationPage } from './ArrivalRegistrationPage'
import { vi } from 'vitest'
import { purchaseOrderApi } from '../../lib/purchase-order-api'
import { arrivalApi } from '../../lib/arrival-api'
import { itemApi } from '../../lib/item-api'

vi.mock('../../lib/purchase-order-api', () => ({
  purchaseOrderApi: {
    getById: vi.fn(),
    getAll: vi.fn(),
  },
}))

vi.mock('../../lib/arrival-api', () => ({
  arrivalApi: {
    register: vi.fn(),
  },
}))

vi.mock('../../lib/item-api', () => ({
  itemApi: {
    findAll: vi.fn(),
  },
}))

function renderPage(purchaseOrderId = '1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[`/admin/purchase-orders/${purchaseOrderId}/arrivals/new`]}>
          <Routes>
            <Route path="/admin/purchase-orders/:id/arrivals/new" element={<ArrivalRegistrationPage />} />
            <Route path="/admin/purchase-orders" element={<div>発注一覧</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('ArrivalRegistrationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('発注情報が表示される', async () => {
    vi.mocked(purchaseOrderApi.getById).mockResolvedValue({
      data: {
        id: 1,
        itemId: 10,
        supplierName: '花卸問屋A',
        quantity: 20,
        desiredDeliveryDate: '2026-05-10',
        status: 'ORDERED',
        orderedAt: '2026-05-05T10:00:00',
      },
    } as never)
    vi.mocked(itemApi.findAll).mockResolvedValue({
      data: [{ id: 10, name: 'バラ', qualityRetentionDays: 7, purchaseUnit: 10, leadTimeDays: 3, supplierName: '花卸問屋A' }],
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('発注情報')).toBeInTheDocument()
      expect(screen.getByText('花卸問屋A')).toBeInTheDocument()
    })
  })

  it('入荷登録ボタンで確認ダイアログが表示される', async () => {
    vi.mocked(purchaseOrderApi.getById).mockResolvedValue({
      data: {
        id: 1,
        itemId: 10,
        supplierName: '花卸問屋A',
        quantity: 20,
        desiredDeliveryDate: '2026-05-10',
        status: 'ORDERED',
        orderedAt: '2026-05-05T10:00:00',
      },
    } as never)
    vi.mocked(itemApi.findAll).mockResolvedValue({
      data: [{ id: 10, name: 'バラ', qualityRetentionDays: 7, purchaseUnit: 10, leadTimeDays: 3, supplierName: '花卸問屋A' }],
    } as never)

    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('入荷情報')).toBeInTheDocument()
    })

    const quantityInput = screen.getByLabelText('入荷数量')
    await user.clear(quantityInput)
    await user.type(quantityInput, '10')

    const submitButton = screen.getByRole('button', { name: '入荷登録' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('入荷登録の確認')).toBeInTheDocument()
    })
  })

  it('数量が0以下だとエラーが表示される', async () => {
    vi.mocked(purchaseOrderApi.getById).mockResolvedValue({
      data: {
        id: 1,
        itemId: 10,
        supplierName: '花卸問屋A',
        quantity: 20,
        desiredDeliveryDate: '2026-05-10',
        status: 'ORDERED',
        orderedAt: '2026-05-05T10:00:00',
      },
    } as never)
    vi.mocked(itemApi.findAll).mockResolvedValue({
      data: [{ id: 10, name: 'バラ', qualityRetentionDays: 7, purchaseUnit: 10, leadTimeDays: 3, supplierName: '花卸問屋A' }],
    } as never)

    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('入荷情報')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: '入荷登録' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('数量は1以上で入力してください')).toBeInTheDocument()
    })
  })
})
