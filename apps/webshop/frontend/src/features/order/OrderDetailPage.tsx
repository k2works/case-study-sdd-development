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

const CANCELLABLE_STATUSES = ['ORDERED', 'ACCEPTED']

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const queryClient = useQueryClient()
  const [isAccepting, setIsAccepting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

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

  const cancelMutation = useMutation({
    mutationFn: () => orderAdminApi.cancelOrder(orderId),
    onSuccess: () => {
      setShowCancelDialog(false)
      setToast('注文をキャンセルしました')
      setTimeout(() => setToast(null), 3000)
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })

  const handleAccept = () => {
    if (isAccepting) return
    setIsAccepting(true)
    acceptMutation.mutate()
  }

  const canCancel = order ? CANCELLABLE_STATUSES.includes(order.status) : false

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

        {/* キャンセルボタン */}
        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <div className="pt-4">
            <button
              type="button"
              onClick={() => canCancel && setShowCancelDialog(true)}
              disabled={!canCancel}
              title={!canCancel ? '出荷準備中のためキャンセルできません。対応が必要な場合は店長にご相談ください' : undefined}
              className="bg-red-600 text-white font-medium rounded-lg px-5 py-2.5 hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
          </div>
        )}

        {cancelMutation.isError && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">
            キャンセル処理に失敗しました。もう一度お試しください。
          </div>
        )}
      </div>

      {/* キャンセル確認ダイアログ */}
      {showCancelDialog && order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">キャンセル確認</h3>
            <p className="text-gray-600 mb-2">
              注文 #{order.id}（{order.productName}）をキャンセルしますか？
            </p>
            <p className="text-gray-600 mb-2">
              得意先: {order.customerName}
            </p>
            <p className="text-amber-700 text-sm mb-6">
              在庫引当が解除されます。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                戻る
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="px-5 py-2.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? '処理中...' : 'キャンセルを実行'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
