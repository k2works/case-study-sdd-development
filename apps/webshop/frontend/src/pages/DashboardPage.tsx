import { Link } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">ダッシュボード</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <p className="text-gray-600">
          ようこそ、<span className="font-medium text-gray-900">{user?.lastName} {user?.firstName}</span> さん
        </p>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">クイックアクション</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/items"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline group"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium text-gray-900 group-hover:text-emerald-700">単品一覧を見る</div>
            <div className="text-sm text-gray-500 mt-1">登録済みの花材を確認・管理</div>
          </Link>
          <Link
            to="/items/new"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline group"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="font-medium text-gray-900 group-hover:text-emerald-700">新しい単品を登録する</div>
            <div className="text-sm text-gray-500 mt-1">花材・資材を新規追加</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
