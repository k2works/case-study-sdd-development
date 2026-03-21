import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { ProductCompositionPage } from './ProductCompositionPage'
import { vi } from 'vitest'
import { productApi } from '../../lib/product-api'
import { itemApi } from '../../lib/item-api'

vi.mock('../../lib/product-api', () => ({
  productApi: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getCompositions: vi.fn(),
    addComposition: vi.fn(),
    removeComposition: vi.fn(),
  },
  catalogApi: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}))

vi.mock('../../lib/item-api', () => ({
  itemApi: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  }
})

const mockProduct = {
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
}

const mockItems = [
  { id: 1, name: 'バラ', shelfLifeDays: 7, purchaseUnit: 10, leadTimeDays: 2, supplierName: '花卸A' },
  { id: 2, name: 'チューリップ', shelfLifeDays: 5, purchaseUnit: 20, leadTimeDays: 3, supplierName: '花卸B' },
]

function renderProductCompositionPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <ProductCompositionPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('ProductCompositionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(productApi.findById).mockResolvedValue({ data: mockProduct } as never)
    vi.mocked(itemApi.findAll).mockResolvedValue({ data: mockItems } as never)
  })

  it('花束構成管理のタイトルが表示される', async () => {
    renderProductCompositionPage()

    await waitFor(() => {
      expect(screen.getByText(/花束構成管理/)).toBeInTheDocument()
    })
  })

  it('構成花材の一覧が表示される', async () => {
    renderProductCompositionPage()

    await waitFor(() => {
      expect(screen.getByText('バラ')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  it('花材追加のドロップダウンが表示される', async () => {
    renderProductCompositionPage()

    await waitFor(() => {
      expect(screen.getByLabelText('花材')).toBeInTheDocument()
    })
  })

  it('数量入力フィールドが表示される', async () => {
    renderProductCompositionPage()

    await waitFor(() => {
      expect(screen.getByLabelText('数量')).toBeInTheDocument()
    })
  })

  it('追加ボタンが表示される', async () => {
    renderProductCompositionPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument()
    })
  })
})
