import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { RegisterPage } from './RegisterPage'
import { vi } from 'vitest'

vi.mock('../../lib/auth-api', () => ({
  authApi: {
    register: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

function renderRegisterPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('新規登録フォームが表示される', () => {
    renderRegisterPage()
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument()
    expect(screen.getByLabelText('姓')).toBeInTheDocument()
    expect(screen.getByLabelText('名')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument()
  })

  it('ログインリンクが表示される', () => {
    renderRegisterPage()
    expect(screen.getByText('ログインはこちら')).toBeInTheDocument()
  })

  it('必須項目未入力でバリデーションエラーが表示される', async () => {
    renderRegisterPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: '登録' }))

    await waitFor(() => {
      expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument()
    })
  })

  it('正しい入力で登録が実行される', async () => {
    const { authApi } = await import('../../lib/auth-api')
    vi.mocked(authApi.register).mockResolvedValue({
      data: {
        token: 'jwt-token',
        email: 'new@example.com',
        role: 'CUSTOMER',
        firstName: '山田',
        lastName: '太郎',
      },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {} as never,
    })

    renderRegisterPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('メールアドレス'), 'new@example.com')
    await user.type(screen.getByLabelText('パスワード'), 'Password1')
    await user.type(screen.getByLabelText('パスワード（確認）'), 'Password1')
    await user.type(screen.getByLabelText('姓'), '山田')
    await user.type(screen.getByLabelText('名'), '太郎')
    await user.click(screen.getByRole('button', { name: '登録' }))

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'Password1',
        firstName: '太郎',
        lastName: '山田',
        phone: '',
      })
    })
  })
})
