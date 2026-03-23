import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shipmentApi } from '../../lib/shipment-api'
import type { ShipmentTargetsResponse, ShipmentTarget } from '../../lib/shipment-api'

export function ShipmentPage() {
  const queryClient = useQueryClient()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [confirmTarget, setConfirmTarget] = useState<ShipmentTarget | null>(null)
  const [shippedOrderIds, setShippedOrderIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery<ShipmentTargetsResponse>({
    queryKey: ['shipment-targets', date],
    queryFn: async () => {
      const res = await shipmentApi.getTargets(date)
      return res.data
    },
  })

  const shipMutation = useMutation({
    mutationFn: (orderId: number) => shipmentApi.shipOrder(orderId),
    onSuccess: (_res, orderId) => {
      setShippedOrderIds((prev) => new Set(prev).add(orderId))
      setConfirmTarget(null)
      setToast(`注文 #${orderId} を出荷処理しました`)
      setTimeout(() => setToast(null), 3000)
      queryClient.invalidateQueries({ queryKey: ['shipment-targets'] })
    },
  })

  const handleShip = (target: ShipmentTarget) => {
    setConfirmTarget(target)
  }

  const handleConfirm = () => {
    if (confirmTarget !== null) {
      shipMutation.mutate(confirmTarget.orderId)
    }
  }

  const handleCancel = () => {
    setConfirmTarget(null)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">出荷一覧</h2>

      <div className="mb-6">
        <label htmlFor="delivery-date" className="block text-sm font-medium text-gray-700 mb-1">
          届け日
        </label>
        <input
          id="delivery-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {isLoading && <p className="text-gray-500">読み込み中...</p>}
      {error && <p className="text-red-600">データの取得に失敗しました</p>}

      {data && data.targets.length === 0 && (
        <p className="text-gray-500">出荷対象の受注はありません</p>
      )}

      {data && data.targets.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">受注番号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">届け日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">届け先氏名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">届け先住所</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.targets.map((target) => {
                const isShipped = shippedOrderIds.has(target.orderId)
                return (
                  <tr key={target.orderId} className={isShipped ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{target.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{target.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{target.deliveryDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{target.recipientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{target.deliveryAddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isShipped ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          出荷済み
                        </span>
                      ) : (
                        <button
                          onClick={() => handleShip(target)}
                          disabled={shipMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 min-h-[48px] min-w-[48px]"
                        >
                          出荷処理
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 出荷確認ダイアログ */}
      {confirmTarget !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">出荷確認</h3>
            <p className="text-gray-600 mb-2">
              注文 #{confirmTarget.orderId}（{confirmTarget.productName}）を出荷処理しますか？
            </p>
            <p className="text-gray-600 mb-2">
              届け先: {confirmTarget.recipientName}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {confirmTarget.deliveryAddress}
            </p>
            <p className="text-amber-700 text-sm mb-6">
              ステータスが「出荷済み」に変更されます。
            </p>
            {shipMutation.isError && (
              <p className="text-red-600 mb-4">出荷処理に失敗しました</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleConfirm}
                disabled={shipMutation.isPending}
                className="px-5 py-2.5 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {shipMutation.isPending ? '処理中...' : '確定'}
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
