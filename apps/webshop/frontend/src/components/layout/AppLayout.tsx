import { Link, Outlet, useNavigate } from 'react-router-dom'
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

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>
          <Link to="/dashboard">フレール・メモワール</Link>
        </h1>
        <nav>
          <Link to="/dashboard">ダッシュボード</Link>
          <Link to="/items">単品管理</Link>
        </nav>
        <div className="user-info">
          <span>
            {user?.firstName} {user?.lastName}
          </span>
          <button onClick={handleLogout}>ログアウト</button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
