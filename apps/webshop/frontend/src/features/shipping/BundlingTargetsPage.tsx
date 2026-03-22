import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bundlingApi } from '../../lib/bundling-api'
import type { BundlingTargetsResponse } from '../../types/bundling'

export function BundlingTargetsPage() {
  const queryClient = useQueryClient()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [confirmOrderId, setConfirmOrderId] = useState<number | null>(null)
  const [completedOrderIds, setCompletedOrderIds] = useState<Set<number>>(new Set())

  const { data, isLoading, error } = useQuery<BundlingTargetsResponse>({
    queryKey: ['bundling-targets', date],
    queryFn: async () => {
      const res = await bundlingApi.getTargets(date)
      return res.data
    },
  })

  const bundleMutation = useMutation({
    mutationFn: (orderId: number) => bundlingApi.bundleOrder(orderId),
    onSuccess: (_res, orderId) => {
      setCompletedOrderIds((prev) => new Set(prev).add(orderId))
      setConfirmOrderId(null)
      queryClient.invalidateQueries({ queryKey: ['bundling-targets'] })
    },
  })

  const handleBundle = (orderId: number) => {
    setConfirmOrderId(orderId)
  }

  const handleConfirm = () => {
    if (confirmOrderId !== null) {
      bundleMutation.mutate(confirmOrderId)
    }
  }

  const handleCancel = () => {
    setConfirmOrderId(null)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">結束対象一覧</h2>

      <div className="mb-6">
        <label htmlFor="shipping-date" className="block text-sm font-medium text-gray-700 mb-1">
          出荷日
        </label>
        <input
          id="shipping-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {isLoading && <p className="text-gray-500">読み込み中...</p>}
      {error && <p className="text-red-600">データの取得に失敗しました</p>}

      {data && data.targets.length === 0 && (
        <p className="text-gray-500">結束対象の受注はありません</p>
      )}

      {data && data.targets.length > 0 && (
        <>
          {data.materialSummary.some((m) => m.shortage > 0) && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 mb-6" role="alert">
              <span className="font-semibold">花材が不足しています。</span>
              {' '}仕入スタッフに連絡してください。不足花材:{' '}
              {data.materialSummary
                .filter((m) => m.shortage > 0)
                .map((m) => `${m.itemName}（不足: ${m.shortage}）`)
                .join('、')}
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注文ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">届け日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">必要花材</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.targets.map((target) => {
                  const isCompleted = completedOrderIds.has(target.orderId) || target.status === 'PREPARING'
                  return (
                    <tr key={target.orderId} className={isCompleted ? 'opacity-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{target.orderId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{target.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{target.deliveryDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isCompleted
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isCompleted ? '準備中' : '受付済み'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {target.requiredItems.map((item) => (
                          <div key={item.itemId}>
                            {item.itemName} x {item.requiredQuantity}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!isCompleted && target.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleBundle(target.orderId)}
                            disabled={bundleMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            結束完了
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">花材サマリー</h3>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">花材名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">必要数量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">在庫数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">不足数</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.materialSummary.map((summary) => (
                  <tr key={summary.itemId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{summary.itemName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{summary.requiredQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{summary.availableStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={summary.shortage > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        {summary.shortage > 0 ? `-${summary.shortage}` : '0'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {confirmOrderId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">結束完了確認</h3>
            <p className="text-gray-600 mb-6">
              注文 #{confirmOrderId} の結束を完了しますか？在庫が消費されます。
            </p>
            {bundleMutation.isError && (
              <p className="text-red-600 mb-4">結束処理に失敗しました</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                disabled={bundleMutation.isPending}
                className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {bundleMutation.isPending ? '処理中...' : '確定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
