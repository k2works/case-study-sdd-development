import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { ShipmentPage } from './ShipmentPage'
import { vi } from 'vitest'
import { shipmentApi } from '../../lib/shipment-api'

vi.mock('../../lib/shipment-api', () => ({
  shipmentApi: {
    getTargets: vi.fn(),
    shipOrder: vi.fn(),
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
          <ShipmentPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('ShipmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('タイトルが表示される', () => {
    vi.mocked(shipmentApi.getTargets).mockResolvedValue({
      data: { deliveryDate: '2026-06-01', targets: [] },
    } as never)

    renderPage()
    expect(screen.getByText('出荷一覧')).toBeInTheDocument()
  })

  it('出荷対象がない場合にメッセージが表示される', async () => {
    vi.mocked(shipmentApi.getTargets).mockResolvedValue({
      data: { deliveryDate: '2026-06-01', targets: [] },
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/出荷対象の受注はありません/)).toBeInTheDocument()
    })
  })

  it('出荷対象一覧が表示される', async () => {
    vi.mocked(shipmentApi.getTargets).mockResolvedValue({
      data: {
        deliveryDate: '2026-06-01',
        targets: [
          {
            orderId: 1,
            productName: '春の花束',
            deliveryDate: '2026-06-01',
            status: 'PREPARING',
            recipientName: '田中花子',
            deliveryAddress: '東京都千代田区1-1-1',
          },
        ],
      },
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('春の花束')).toBeInTheDocument()
      expect(screen.getByText('田中花子')).toBeInTheDocument()
      expect(screen.getByText('東京都千代田区1-1-1')).toBeInTheDocument()
      expect(screen.getByText('出荷処理')).toBeInTheDocument()
    })
  })

  it('出荷ボタンで確認ダイアログが表示される', async () => {
    vi.mocked(shipmentApi.getTargets).mockResolvedValue({
      data: {
        deliveryDate: '2026-06-01',
        targets: [
          {
            orderId: 1,
            productName: '春の花束',
            deliveryDate: '2026-06-01',
            status: 'PREPARING',
            recipientName: '田中花子',
            deliveryAddress: '東京都千代田区1-1-1',
          },
        ],
      },
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('出荷処理')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('出荷処理'))

    expect(screen.getByText('出荷確認')).toBeInTheDocument()
    expect(screen.getByText(/注文 #1（春の花束）を出荷処理しますか/)).toBeInTheDocument()
    expect(screen.getByText(/届け先: 田中花子/)).toBeInTheDocument()
  })

  it('出荷成功後に行がグレーアウトされる', async () => {
    vi.mocked(shipmentApi.getTargets).mockResolvedValue({
      data: {
        deliveryDate: '2026-06-01',
        targets: [
          {
            orderId: 1,
            productName: '春の花束',
            deliveryDate: '2026-06-01',
            status: 'PREPARING',
            recipientName: '田中花子',
            deliveryAddress: '東京都千代田区1-1-1',
          },
        ],
      },
    } as never)

    vi.mocked(shipmentApi.shipOrder).mockResolvedValue({
      data: { id: 1, status: 'SHIPPED' },
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('出荷処理')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('出荷処理'))
    await userEvent.click(screen.getByText('確定'))

    await waitFor(() => {
      expect(screen.getByText('出荷済み')).toBeInTheDocument()
    })
  })
})
