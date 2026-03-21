import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { authApi } from '../../lib/auth-api'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-800 text-white'
        : 'text-emerald-100 hover:bg-emerald-600 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg font-bold m-0">
              <Link to="/dashboard" className="text-white no-underline hover:text-emerald-200 transition-colors">
                フレール・メモワール
              </Link>
            </h1>
            <nav className="flex items-center gap-1">
              <NavLink to="/dashboard" end className={navLinkClass}>
                ダッシュボード
              </NavLink>
              <NavLink to="/items" className={navLinkClass}>
                単品管理
              </NavLink>
              <NavLink to="/products" className={navLinkClass}>
                商品管理
              </NavLink>
              <NavLink to="/catalog/products" className={navLinkClass}>
                商品カタログ
              </NavLink>
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-sm text-emerald-100">
                {user?.lastName} {user?.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
