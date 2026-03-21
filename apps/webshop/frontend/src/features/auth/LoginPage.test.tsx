import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../providers/AuthProvider'
import { LoginPage } from './LoginPage'
import { vi } from 'vitest'

vi.mock('../../lib/auth-api', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLoginPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('ログインフォームが表示される', () => {
    renderLoginPage()
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
  })

  it('新規登録リンクが表示される', () => {
    renderLoginPage()
    expect(screen.getByText('新規登録はこちら')).toBeInTheDocument()
  })

  it('入力なしで送信するとバリデーションエラーが表示される', async () => {
    renderLoginPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument()
    })
  })

  it('正しい入力でログインが実行される', async () => {
    const { authApi } = await import('../../lib/auth-api')
    vi.mocked(authApi.login).mockResolvedValue({
      data: {
        token: 'jwt-token',
        email: 'test@example.com',
        role: 'CUSTOMER',
        firstName: '山田',
        lastName: '太郎',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    renderLoginPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    await user.type(screen.getByLabelText('パスワード'), 'Password1')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password1',
      })
    })
  })
})
