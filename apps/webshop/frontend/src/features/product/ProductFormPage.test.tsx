import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { ProductFormPage } from './ProductFormPage'
import { vi } from 'vitest'

vi.mock('../../lib/product-api', () => ({
  productApi: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  catalogApi: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => vi.fn(),
  }
})

function renderProductFormPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <ProductFormPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('ProductFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('商品登録ページのタイトルが表示される（新規モード）', () => {
    renderProductFormPage()
    expect(screen.getByText('商品登録')).toBeInTheDocument()
  })

  it('商品名の入力フィールドが表示される', () => {
    renderProductFormPage()
    expect(screen.getByLabelText(/商品名/)).toBeInTheDocument()
  })

  it('価格の入力フィールドが表示される', () => {
    renderProductFormPage()
    expect(screen.getByLabelText(/価格/)).toBeInTheDocument()
  })

  it('説明のテキストエリアが表示される', () => {
    renderProductFormPage()
    expect(screen.getByLabelText('説明')).toBeInTheDocument()
  })

  it('登録ボタンが表示される', () => {
    renderProductFormPage()
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument()
  })

  it('キャンセルボタンが表示される', () => {
    renderProductFormPage()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })
})
