import { Link } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { orderAdminApi } from '../lib/order-admin-api'
import type { DashboardSummary } from '../types/order'

export function DashboardPage() {
  const { user } = useAuth()
  const role = user?.role ?? ''
  const showAdminSummary = role === 'OWNER' || role === 'ORDER_STAFF' || role === 'PURCHASE_STAFF'

  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await orderAdminApi.getDashboardSummary()
      return res.data
    },
    enabled: showAdminSummary,
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">ダッシュボード</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <p className="text-gray-600">
          ようこそ、<span className="font-medium text-gray-900">{user?.lastName} {user?.firstName}</span> さん
        </p>
      </div>

      {showAdminSummary && summary && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">業務サマリ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-sm text-gray-500 mb-1">本日の受注</div>
              <div className="text-2xl font-bold text-gray-900">{summary.todayOrderCount}件</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-sm text-gray-500 mb-1">未受付の受注</div>
              <div className="text-2xl font-bold text-amber-600">{summary.pendingOrderCount}件</div>
            </div>
            <Link
              to="/admin/inventory"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline"
            >
              <div className="text-sm text-gray-500 mb-1">在庫管理</div>
              <div className="text-sm font-medium text-emerald-600">在庫推移を確認 →</div>
            </Link>
          </div>
        </div>
      )}

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
          <Link
            to="/products"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline group"
          >
            <div className="text-2xl mb-2">🌸</div>
            <div className="font-medium text-gray-900 group-hover:text-emerald-700">商品管理</div>
            <div className="text-sm text-gray-500 mt-1">花束の登録・構成管理</div>
          </Link>
          <Link
            to="/catalog/products"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline group"
          >
            <div className="text-2xl mb-2">🛒</div>
            <div className="font-medium text-gray-900 group-hover:text-emerald-700">商品カタログ</div>
            <div className="text-sm text-gray-500 mt-1">販売中の花束を確認</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
