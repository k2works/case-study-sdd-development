import { Link } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="dashboard-page">
      <h2>ダッシュボード</h2>
      <p>
        ようこそ、{user?.lastName} {user?.firstName} さん
      </p>
      <div className="quick-actions">
        <h3>クイックアクション</h3>
        <ul>
          <li><Link to="/items">単品一覧を見る</Link></li>
          <li><Link to="/items/new">新しい単品を登録する</Link></li>
        </ul>
      </div>
    </div>
  )
}
