import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { orderAdminApi } from '../../lib/order-admin-api'
import type { OrderResponse } from '../../types/order'

const STATUS_LABELS: Record<string, string> = {
  ORDERED: '注文受付',
  ACCEPTED: '受付済み',
  PREPARING: '出荷準備中',
  SHIPPED: '出荷済み',
  DELIVERED: '届け完了',
  CANCELLED: 'キャンセル',
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const queryClient = useQueryClient()
  const [isAccepting, setIsAccepting] = useState(false)

  const { data: order, isLoading } = useQuery<OrderResponse>({
    queryKey: ['admin-orders', orderId],
    queryFn: async () => {
      const res = await orderAdminApi.findById(orderId)
      return res.data
    },
  })

  const acceptMutation = useMutation({
    mutationFn: () => orderAdminApi.acceptOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onSettled: () => {
      setIsAccepting(false)
    },
  })

  const handleAccept = () => {
    if (isAccepting) return
    setIsAccepting(true)
    acceptMutation.mutate()
  }

  if (isLoading) {
    return <p className="text-gray-500 text-center py-12">読み込み中...</p>
  }

  if (!order) {
    return <p className="text-gray-500 text-center py-12">注文が見つかりません。</p>
  }

  return (
    <div>
      <Link
        to="/admin/orders"
        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mb-4 inline-block"
      >
        ← 受注一覧に戻る
      </Link>

      <h2 className="text-2xl font-semibold text-gray-900 mb-6">注文詳細</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl space-y-6">
        <dl className="space-y-3">
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">注文 ID</dt>
            <dd className="text-sm text-gray-900">{order.id}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">顧客 ID</dt>
            <dd className="text-sm text-gray-900">{order.customerId}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">商品 ID</dt>
            <dd className="text-sm text-gray-900">{order.productId}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">届け先 ID</dt>
            <dd className="text-sm text-gray-900">{order.deliveryDestinationId}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">配達日</dt>
            <dd className="text-sm text-gray-900">{order.deliveryDate}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">メッセージ</dt>
            <dd className="text-sm text-gray-900 whitespace-pre-wrap">
              {order.message ?? '—'}
            </dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">ステータス</dt>
            <dd>
              <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">注文日時</dt>
            <dd className="text-sm text-gray-900">{order.orderedAt}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">更新日時</dt>
            <dd className="text-sm text-gray-900">{order.updatedAt}</dd>
          </div>
        </dl>

        {acceptMutation.isError && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">
            受付処理に失敗しました。もう一度お試しください。
          </div>
        )}

        {order.status === 'ORDERED' && (
          <div className="pt-4">
            <button
              type="button"
              onClick={handleAccept}
              disabled={isAccepting}
              className="bg-emerald-600 text-white font-medium rounded-lg px-6 py-2.5 hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAccepting && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              受付する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
