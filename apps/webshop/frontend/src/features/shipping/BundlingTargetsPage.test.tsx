import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { BundlingTargetsPage } from './BundlingTargetsPage'
import { vi } from 'vitest'
import { bundlingApi } from '../../lib/bundling-api'

vi.mock('../../lib/bundling-api', () => ({
  bundlingApi: {
    getTargets: vi.fn(),
    bundleOrder: vi.fn(),
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
          <BundlingTargetsPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('BundlingTargetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('タイトルが表示される', () => {
    vi.mocked(bundlingApi.getTargets).mockResolvedValue({
      data: { shippingDate: '2026-06-01', targets: [], materialSummary: [] },
    } as never)

    renderPage()
    expect(screen.getByText('結束対象一覧')).toBeInTheDocument()
  })

  it('結束対象がない場合にメッセージが表示される', async () => {
    vi.mocked(bundlingApi.getTargets).mockResolvedValue({
      data: { shippingDate: '2026-06-01', targets: [], materialSummary: [] },
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/結束対象の受注はありません/)).toBeInTheDocument()
    })
  })

  it('結束対象一覧が表示される', async () => {
    vi.mocked(bundlingApi.getTargets).mockResolvedValue({
      data: {
        shippingDate: '2026-06-01',
        targets: [
          {
            orderId: 1,
            productName: '春の花束',
            deliveryDate: '2026-06-01',
            status: 'ACCEPTED',
            requiredItems: [{ itemId: 1, itemName: 'バラ', requiredQuantity: 3 }],
          },
        ],
        materialSummary: [
          { itemId: 1, itemName: 'バラ', requiredQuantity: 3, availableStock: 10, shortage: 0 },
        ],
      },
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('春の花束')).toBeInTheDocument()
      expect(screen.getByText('バラ x 3')).toBeInTheDocument()
      expect(screen.getByText('結束完了')).toBeInTheDocument()
    })
  })

  it('花材サマリーが表示される', async () => {
    vi.mocked(bundlingApi.getTargets).mockResolvedValue({
      data: {
        shippingDate: '2026-06-01',
        targets: [
          {
            orderId: 1,
            productName: '春の花束',
            deliveryDate: '2026-06-01',
            status: 'ACCEPTED',
            requiredItems: [{ itemId: 1, itemName: 'バラ', requiredQuantity: 5 }],
          },
        ],
        materialSummary: [
          { itemId: 1, itemName: 'バラ', requiredQuantity: 5, availableStock: 3, shortage: 2 },
        ],
      },
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('花材サマリー')).toBeInTheDocument()
      expect(screen.getByText('-2')).toBeInTheDocument()
    })
  })

  it('結束完了ボタンで確認ダイアログが表示される', async () => {
    vi.mocked(bundlingApi.getTargets).mockResolvedValue({
      data: {
        shippingDate: '2026-06-01',
        targets: [
          {
            orderId: 1,
            productName: '春の花束',
            deliveryDate: '2026-06-01',
            status: 'ACCEPTED',
            requiredItems: [{ itemId: 1, itemName: 'バラ', requiredQuantity: 3 }],
          },
        ],
        materialSummary: [],
      },
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('結束完了')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('結束完了'))

    expect(screen.getByText('結束完了確認')).toBeInTheDocument()
    expect(screen.getByText(/注文 #1 の結束を完了しますか/)).toBeInTheDocument()
  })
})
