import { Link } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../lib/dashboard-api'
import type { DashboardSummary } from '../types/order'

export function DashboardPage() {
  const { user } = useAuth()
  const role = user?.role ?? ''
  const isCustomer = role === 'CUSTOMER'
  const isStaff = !isCustomer && role !== ''

  const { data: summary, isLoading, isError } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await dashboardApi.getSummary()
      return res.data
    },
    enabled: isStaff,
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">ダッシュボード</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <p className="text-gray-600">
          ようこそ、<span className="font-medium text-gray-900">{user?.lastName} {user?.firstName}</span> さん
        </p>
      </div>

      {isStaff && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">業務サマリ</h3>
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          )}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              業務サマリの取得に失敗しました。
            </div>
          )}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* カード1: 本日の受注 */}
              <Link
                to="/admin/orders"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline"
              >
                <div className="text-sm font-medium text-gray-700 mb-3">本日の受注</div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">総受注数</span>
                    <span className="text-lg font-bold text-gray-900">{summary.totalOrders}件</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">未受付</span>
                    <span className="text-lg font-bold text-amber-600">{summary.orderedCount}件</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-emerald-600 mt-3">受注管理へ →</div>
              </Link>

              {/* カード2: 在庫アラート */}
              <Link
                to="/admin/inventory"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline"
              >
                <div className="text-sm font-medium text-gray-700 mb-3">在庫アラート</div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">不足注意</span>
                    <span className={`text-lg font-bold ${summary.lowStockItems > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {summary.lowStockItems}品目
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">在庫不足</span>
                    <span className={`text-lg font-bold ${summary.outOfStockItems > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {summary.outOfStockItems}品目
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-emerald-600 mt-3">在庫管理へ →</div>
              </Link>

              {/* カード3: 本日の出荷 */}
              <Link
                to="/admin/bundling"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline"
              >
                <div className="text-sm font-medium text-gray-700 mb-3">本日の出荷</div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">結束待ち</span>
                    <span className={`text-lg font-bold ${summary.bundlingCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {summary.bundlingCount}件
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">出荷待ち</span>
                    <span className={`text-lg font-bold ${summary.shippingCount > 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                      {summary.shippingCount}件
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-emerald-600 mt-3">出荷管理へ →</div>
              </Link>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">クイックアクション</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isCustomer && (
            <Link
              to="/items"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline group"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium text-gray-900 group-hover:text-emerald-700">単品一覧を見る</div>
              <div className="text-sm text-gray-500 mt-1">登録済みの花材を確認・管理</div>
            </Link>
          )}
          {!isCustomer && (
            <Link
              to="/products"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline group"
            >
              <div className="text-2xl mb-2">🌸</div>
              <div className="font-medium text-gray-900 group-hover:text-emerald-700">商品管理</div>
              <div className="text-sm text-gray-500 mt-1">花束の登録・構成管理</div>
            </Link>
          )}
          <Link
            to="/catalog/products"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline group"
          >
            <div className="text-2xl mb-2">🛒</div>
            <div className="font-medium text-gray-900 group-hover:text-emerald-700">商品カタログ</div>
            <div className="text-sm text-gray-500 mt-1">販売中の花束を確認</div>
          </Link>
          {isCustomer && (
            <Link
              to="/orders/my"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all no-underline group"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="font-medium text-gray-900 group-hover:text-emerald-700">注文履歴</div>
              <div className="text-sm text-gray-500 mt-1">過去の注文を確認</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
