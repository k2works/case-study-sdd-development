import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { ProductListPage } from './ProductListPage'
import { vi } from 'vitest'
import { productApi } from '../../lib/product-api'

vi.mock('../../lib/product-api', () => ({
  productApi: {
    findAll: vi.fn(),
    delete: vi.fn(),
  },
  catalogApi: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}))

function renderProductListPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <ProductListPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('商品管理ページのタイトルが表示される', () => {
    vi.mocked(productApi.findAll).mockResolvedValue({ data: [] } as never)

    renderProductListPage()
    expect(screen.getByText('商品管理')).toBeInTheDocument()
  })

  it('新規商品登録ボタンが表示される', () => {
    vi.mocked(productApi.findAll).mockResolvedValue({ data: [] } as never)

    renderProductListPage()
    expect(screen.getByText('新規商品を登録')).toBeInTheDocument()
  })

  it('商品一覧が表示される', async () => {
    vi.mocked(productApi.findAll).mockResolvedValue({
      data: [
        {
          id: 1,
          name: '春の花束',
          price: 5000,
          description: '春の花を使った花束',
          active: true,
          compositions: [
            { id: 1, itemId: 1, itemName: 'バラ', quantity: 3 },
          ],
          createdAt: '2026-04-07T00:00:00',
          updatedAt: '2026-04-07T00:00:00',
        },
      ],
    } as never)

    renderProductListPage()

    await waitFor(() => {
      expect(screen.getByText('春の花束')).toBeInTheDocument()
      expect(screen.getByText('¥5,000')).toBeInTheDocument()
      expect(screen.getByText('1種')).toBeInTheDocument()
      expect(screen.getByText('販売中')).toBeInTheDocument()
    })
  })

  it('商品がない場合は空メッセージが表示される', async () => {
    vi.mocked(productApi.findAll).mockResolvedValue({ data: [] } as never)

    renderProductListPage()

    await waitFor(() => {
      expect(screen.getByText('登録された商品はありません。')).toBeInTheDocument()
    })
  })
})
