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

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>
          <Link to="/dashboard">フレール・メモワール</Link>
        </h1>
        <nav>
          <NavLink to="/dashboard" end>ダッシュボード</NavLink>
          <NavLink to="/items">単品管理</NavLink>
        </nav>
        <div className="user-info">
          <span>
            {user?.lastName} {user?.firstName}
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
