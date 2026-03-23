import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { OrderFormPage } from './OrderFormPage'
import { vi } from 'vitest'
import { catalogApi } from '../../lib/product-api'
import { deliveryDestinationApi } from '../../lib/delivery-destination-api'

vi.mock('../../lib/product-api', () => ({
  catalogApi: {
    findById: vi.fn(),
  },
}))

vi.mock('../../lib/delivery-destination-api', () => ({
  deliveryDestinationApi: {
    getMyDestinations: vi.fn(),
  },
}))

const mockProduct = {
  id: 1,
  name: '赤バラのクラシックブーケ',
  price: 5000,
  description: 'テスト商品',
  imageUrl: '/images/test.jpg',
  category: 'bouquet',
}

const mockDestinations = [
  {
    id: 1,
    recipientName: '田中 太郎',
    postalCode: '100-0001',
    address: '東京都千代田区1-1-1',
    phone: '090-1234-5678',
  },
  {
    id: 2,
    recipientName: '佐藤 花子',
    postalCode: '150-0002',
    address: '東京都渋谷区2-2-2',
    phone: null,
  },
]

function renderOrderFormPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/orders/new/1']}>
          <Routes>
            <Route path="/orders/new/:productId" element={<OrderFormPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('OrderFormPage - 届け先コピー機能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(catalogApi.findById).mockResolvedValue({ data: mockProduct } as never)
  })

  it('過去の届け先がある場合、選択モードのラジオボタンが表示される', async () => {
    vi.mocked(deliveryDestinationApi.getMyDestinations).mockResolvedValue(mockDestinations)

    renderOrderFormPage()

    await waitFor(() => {
      expect(screen.getByLabelText('新しい届け先を入力')).toBeInTheDocument()
      expect(screen.getByLabelText('過去の届け先から選択')).toBeInTheDocument()
    })
  })

  it('届け先が 0 件の場合、ラジオボタンが表示されない', async () => {
    vi.mocked(deliveryDestinationApi.getMyDestinations).mockResolvedValue([])

    renderOrderFormPage()

    await waitFor(() => {
      expect(screen.getByText('注文入力')).toBeInTheDocument()
    })

    expect(screen.queryByLabelText('新しい届け先を入力')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('過去の届け先から選択')).not.toBeInTheDocument()
  })

  it('届け先を選択するとフォームにプリフィルされる', async () => {
    vi.mocked(deliveryDestinationApi.getMyDestinations).mockResolvedValue(mockDestinations)
    const user = userEvent.setup()

    renderOrderFormPage()

    await waitFor(() => {
      expect(screen.getByLabelText('過去の届け先から選択')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('過去の届け先から選択'))

    await waitFor(() => {
      expect(screen.getByText('田中 太郎')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /田中 太郎/ }))

    await waitFor(() => {
      expect(screen.getByLabelText(/届け先氏名/)).toHaveValue('田中 太郎')
      expect(screen.getByLabelText(/郵便番号/)).toHaveValue('100-0001')
      expect(screen.getByLabelText(/住所/)).toHaveValue('東京都千代田区1-1-1')
      expect(screen.getByLabelText(/電話番号/)).toHaveValue('090-1234-5678')
    })
  })

  it('「新しい届け先を入力」に戻すとフォームがクリアされる', async () => {
    vi.mocked(deliveryDestinationApi.getMyDestinations).mockResolvedValue(mockDestinations)
    const user = userEvent.setup()

    renderOrderFormPage()

    await waitFor(() => {
      expect(screen.getByLabelText('過去の届け先から選択')).toBeInTheDocument()
    })

    // 過去の届け先から選択
    await user.click(screen.getByLabelText('過去の届け先から選択'))

    await waitFor(() => {
      expect(screen.getByText('田中 太郎')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /田中 太郎/ }))

    await waitFor(() => {
      expect(screen.getByLabelText(/届け先氏名/)).toHaveValue('田中 太郎')
    })

    // 新しい届け先を入力に戻す
    await user.click(screen.getByLabelText('新しい届け先を入力'))

    await waitFor(() => {
      expect(screen.getByLabelText(/届け先氏名/)).toHaveValue('')
      expect(screen.getByLabelText(/郵便番号/)).toHaveValue('')
      expect(screen.getByLabelText(/住所/)).toHaveValue('')
      expect(screen.getByLabelText(/電話番号/)).toHaveValue('')
    })
  })

  it('プリフィル後にフィールドが編集可能', async () => {
    vi.mocked(deliveryDestinationApi.getMyDestinations).mockResolvedValue(mockDestinations)
    const user = userEvent.setup()

    renderOrderFormPage()

    await waitFor(() => {
      expect(screen.getByLabelText('過去の届け先から選択')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('過去の届け先から選択'))

    await waitFor(() => {
      expect(screen.getByText('田中 太郎')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /田中 太郎/ }))

    await waitFor(() => {
      expect(screen.getByLabelText(/届け先氏名/)).toHaveValue('田中 太郎')
    })

    // プリフィルされた値をクリアして新しい値を入力
    const nameInput = screen.getByLabelText(/届け先氏名/)
    await user.clear(nameInput)
    await user.type(nameInput, '山田 次郎')

    expect(nameInput).toHaveValue('山田 次郎')
  })
})
