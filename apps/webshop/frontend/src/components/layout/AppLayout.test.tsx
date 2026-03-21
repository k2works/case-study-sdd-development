import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { vi } from 'vitest'

const mockUseAuth = vi.fn()

vi.mock('../../providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('../../lib/auth-api', () => ({
  authApi: { logout: vi.fn() },
}))

function renderAppLayout(role: string) {
  mockUseAuth.mockReturnValue({
    user: { email: 'test@example.com', role, firstName: '太郎', lastName: '山田' },
    token: 'dummy',
    logout: vi.fn(),
    isAuthenticated: true,
  })

  return render(
    <MemoryRouter>
      <AppLayout />
    </MemoryRouter>
  )
}

describe('AppLayout ナビゲーション', () => {
  it('CUSTOMER ロールでは「注文履歴」が表示され「受注管理」は非表示', () => {
    renderAppLayout('CUSTOMER')

    expect(screen.getByRole('link', { name: '商品カタログ' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '注文履歴' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '受注管理' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '単品管理' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '商品管理' })).not.toBeInTheDocument()
  })

  it('OWNER ロールでは「受注管理」が表示され「注文履歴」は非表示', () => {
    renderAppLayout('OWNER')

    expect(screen.getByRole('link', { name: '受注管理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '単品管理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '商品管理' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '注文履歴' })).not.toBeInTheDocument()
  })

  it('ORDER_STAFF ロールでは「受注管理」が表示される', () => {
    renderAppLayout('ORDER_STAFF')

    expect(screen.getByRole('link', { name: '受注管理' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '注文履歴' })).not.toBeInTheDocument()
  })
})
