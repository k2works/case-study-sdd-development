import { useAuth } from '../providers/AuthProvider'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="dashboard-page">
      <h2>ダッシュボード</h2>
      <p>
        ようこそ、{user?.firstName} {user?.lastName} さん
      </p>
    </div>
  )
}
