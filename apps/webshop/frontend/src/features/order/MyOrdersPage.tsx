import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { orderApi } from '../../lib/order-api'
import type { OrderResponse } from '../../types/order'

const STATUS_LABELS: Record<string, string> = {
  ORDERED: '注文受付',
  ACCEPTED: '受付済み',
  PREPARING: '出荷準備中',
  SHIPPED: '出荷済み',
  DELIVERED: '届け完了',
  CANCELLED: 'キャンセル',
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ORDERED': return 'bg-red-100 text-red-700'
    case 'ACCEPTED': return 'bg-blue-100 text-blue-700'
    case 'PREPARING': return 'bg-yellow-100 text-yellow-700'
    case 'SHIPPED': return 'bg-purple-100 text-purple-700'
    case 'DELIVERED': return 'bg-green-100 text-green-700'
    case 'CANCELLED': return 'bg-gray-100 text-gray-500'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function MyOrdersPage() {
  const { data: orders = [], isLoading } = useQuery<OrderResponse[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await orderApi.getMyOrders()
      return res.data
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">注文履歴</h2>
        <Link
          to="/catalog/products"
          className="bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 text-sm hover:bg-emerald-700 transition-colors no-underline"
        >
          商品カタログへ
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-100" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 border-t border-gray-100 flex items-center px-6 gap-4">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">まだ注文がありません。</p>
          <Link
            to="/catalog/products"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            商品カタログから注文する
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <caption className="sr-only">注文履歴</caption>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">注文番号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">商品名</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">届け先</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">配達日</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">注文日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">ORD-{String(order.id).padStart(3, '0')}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.productName ?? `商品#${order.productId}`}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.recipientName ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.deliveryDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.orderedAt?.split('T')[0] ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
