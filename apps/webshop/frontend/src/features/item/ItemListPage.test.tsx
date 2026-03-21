import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { ItemListPage } from './ItemListPage'
import { vi } from 'vitest'
import { itemApi } from '../../lib/item-api'

vi.mock('../../lib/item-api', () => ({
  itemApi: {
    findAll: vi.fn(),
    delete: vi.fn(),
  },
}))

function renderItemListPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <ItemListPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('ItemListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('単品一覧ページのタイトルが表示される', () => {
    vi.mocked(itemApi.findAll).mockResolvedValue({ data: [] } as never)

    renderItemListPage()
    expect(screen.getByText('単品管理')).toBeInTheDocument()
  })

  it('新規登録ボタンが表示される', () => {
    vi.mocked(itemApi.findAll).mockResolvedValue({ data: [] } as never)

    renderItemListPage()
    expect(screen.getByText('新規登録')).toBeInTheDocument()
  })

  it('単品一覧が表示される', async () => {
    vi.mocked(itemApi.findAll).mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'バラ',
          shelfLifeDays: 7,
          purchaseUnit: 10,
          leadTimeDays: 3,
          supplierName: '花卸問屋A',
        },
      ],
    } as never)

    renderItemListPage()

    await waitFor(() => {
      expect(screen.getByText('バラ')).toBeInTheDocument()
      expect(screen.getByText('花卸問屋A')).toBeInTheDocument()
    })
  })
})
