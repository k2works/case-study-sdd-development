import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { orderAdminApi } from '../../lib/order-admin-api'
import type { OrderResponse } from '../../types/order'

const STATUS_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'ORDERED', label: '注文受付' },
  { value: 'ACCEPTED', label: '受付済み' },
  { value: 'PREPARING', label: '出荷準備中' },
  { value: 'SHIPPED', label: '出荷済み' },
  { value: 'DELIVERED', label: '届け完了' },
  { value: 'CANCELLED', label: 'キャンセル' },
]

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

export function OrderListPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const params: { status?: string; from?: string; to?: string } = {}
  if (statusFilter) params.status = statusFilter
  if (fromDate) params.from = fromDate
  if (toDate) params.to = toDate

  const { data: orders = [], isLoading } = useQuery<OrderResponse[]>({
    queryKey: ['admin-orders', statusFilter, fromDate, toDate],
    queryFn: async () => {
      const res = await orderAdminApi.findAll(params)
      return res.data
    },
  })

  const bulkAcceptMutation = useMutation({
    mutationFn: (orderIds: number[]) => orderAdminApi.bulkAcceptOrders(orderIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      setSelectedIds(new Set())
    },
  })

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    const orderedItems = orders.filter((o) => o.status === 'ORDERED')
    if (selectedIds.size === orderedItems.length && orderedItems.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orderedItems.map((o) => o.id)))
    }
  }

  const handleBulkAccept = () => {
    if (selectedIds.size === 0) return
    bulkAcceptMutation.mutate(Array.from(selectedIds))
  }

  const orderedItems = orders.filter((o) => o.status === 'ORDERED')
  const allOrderedSelected = orderedItems.length > 0 && orderedItems.every((o) => selectedIds.has(o.id))

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">受注管理</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
              開始日
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
              終了日
            </label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleBulkAccept}
            disabled={selectedIds.size === 0 || bulkAcceptMutation.isPending}
            className="bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            一括受付（{selectedIds.size}件）
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-100" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 border-t border-gray-100 flex items-center px-6 gap-4">
                <div className="h-4 w-4 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">注文データがありません。</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <caption className="sr-only">受注一覧</caption>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allOrderedSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                    aria-label="すべて選択"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">注文番号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">商品名</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">得意先</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">配達日</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {order.status === 'ORDERED' ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="rounded border-gray-300"
                        aria-label={`注文 ${order.id} を選択`}
                      />
                    ) : (
                      <span className="w-4 inline-block" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">ORD-{String(order.id).padStart(3, '0')}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.productName ?? `商品#${order.productId}`}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.customerName ?? `顧客#${order.customerId}`}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.deliveryDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
