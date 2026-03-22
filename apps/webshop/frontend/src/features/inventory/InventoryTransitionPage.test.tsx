import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { InventoryTransitionPage } from './InventoryTransitionPage'
import { vi } from 'vitest'
import { itemApi } from '../../lib/item-api'
import { inventoryApi } from '../../lib/inventory-api'

vi.mock('../../lib/item-api', () => ({
  itemApi: {
    findAll: vi.fn(),
  },
}))

vi.mock('../../lib/inventory-api', () => ({
  inventoryApi: {
    getTransition: vi.fn(),
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
          <InventoryTransitionPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('InventoryTransitionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('タイトルが表示される', () => {
    vi.mocked(itemApi.findAll).mockResolvedValue({ data: [] } as never)

    renderPage()
    expect(screen.getByText('在庫推移')).toBeInTheDocument()
  })

  it('単品セレクタが表示される', async () => {
    vi.mocked(itemApi.findAll).mockResolvedValue({
      data: [{ id: 1, name: 'バラ', qualityRetentionDays: 7, purchaseUnit: 10, leadTimeDays: 3, supplierName: '花卸A' }],
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('バラ')).toBeInTheDocument()
    })
  })

  it('単品未選択時にガイドメッセージが表示される', () => {
    vi.mocked(itemApi.findAll).mockResolvedValue({ data: [] } as never)

    renderPage()
    expect(screen.getByText('単品を選択して在庫推移を表示します。')).toBeInTheDocument()
  })
})
