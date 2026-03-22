import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { purchaseOrderApi } from '../../lib/purchase-order-api'
import { itemApi } from '../../lib/item-api'
import type { Item } from '../../types/item'
import type { PurchaseOrder } from '../../types/purchase-order'

const statusLabels: Record<string, string> = {
  ORDERED: '発注済み',
  PARTIAL: '一部入荷',
  RECEIVED: '入荷済み',
}

const statusColors: Record<string, string> = {
  ORDERED: 'bg-blue-100 text-blue-800',
  PARTIAL: 'bg-amber-100 text-amber-800',
  RECEIVED: 'bg-green-100 text-green-800',
}

export function PurchaseOrderPage() {
  const [searchParams] = useSearchParams()
  const preselectedItemId = searchParams.get('itemId')
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [selectedItemId, setSelectedItemId] = useState<number | null>(
    preselectedItemId ? Number(preselectedItemId) : null
  )
  const [quantity, setQuantity] = useState<number>(0)
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ quantity: number } | null>(null)

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await itemApi.findAll()
      return res.data
    },
  })

  const selectedItem = items.find((i) => i.id === selectedItemId)

  const { data: orders = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders', statusFilter],
    queryFn: async () => {
      const res = await purchaseOrderApi.getAll(statusFilter || undefined)
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (actualQuantity: number) =>
      purchaseOrderApi.create({
        itemId: selectedItemId!,
        quantity: actualQuantity,
        desiredDeliveryDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setQuantity(0)
      setDesiredDeliveryDate('')
      setError(null)
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : '発注に失敗しました'
      setError(message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!selectedItemId || quantity <= 0 || !desiredDeliveryDate) {
      setError('全ての項目を入力してください')
      return
    }
    let finalQuantity = quantity
    if (selectedItem && quantity % selectedItem.purchaseUnit !== 0) {
      const rounded = Math.ceil(quantity / selectedItem.purchaseUnit) * selectedItem.purchaseUnit
      if (!window.confirm(`${quantity} → ${rounded} 本に切り上げますか？`)) {
        return
      }
      finalQuantity = rounded
      setQuantity(rounded)
    }
    setConfirmDialog({ quantity: finalQuantity })
  }

  const handleConfirmOrder = () => {
    if (confirmDialog) {
      createMutation.mutate(confirmDialog.quantity)
      setConfirmDialog(null)
    }
  }

  const getItemName = (itemId: number) => {
    const item = items.find((i) => i.id === itemId)
    return item?.name ?? `ID: ${itemId}`
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">発注管理</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">新規発注</h3>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="itemSelect" className="block text-sm font-medium text-gray-700 mb-1">
                単品
              </label>
              <select
                id="itemSelect"
                value={selectedItemId ?? ''}
                onChange={(e) => setSelectedItemId(e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">単品を選択してください</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedItem && (
              <div className="flex items-end">
                <div className="text-sm text-gray-600 space-y-1">
                  <p>仕入先: {selectedItem.supplierName}</p>
                  <p>購入単位: {selectedItem.purchaseUnit} / リードタイム: {selectedItem.leadTimeDays}日</p>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                数量
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder={selectedItem ? `${selectedItem.purchaseUnit}の倍数` : ''}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                希望納品日
              </label>
              <input
                id="deliveryDate"
                type="date"
                value={desiredDeliveryDate}
                onChange={(e) => setDesiredDeliveryDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !selectedItemId}
            className="bg-emerald-600 text-white font-medium rounded-lg px-6 py-3 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? '発注中...' : '発注する'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">発注一覧</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">すべて</option>
            <option value="ORDERED">発注済み</option>
            <option value="PARTIAL">一部入荷</option>
            <option value="RECEIVED">入荷済み</option>
          </select>
        </div>
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">
              まだ発注がありません。在庫推移を確認して発注を作成してください。
            </p>
          </div>
        ) : (
          <table className="w-full">
            <caption className="sr-only">発注一覧</caption>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">単品</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">仕入先</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">数量</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">希望納品日</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ステータス</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">発注日時</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {getItemName(order.itemId)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{order.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.desiredDeliveryDate}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(order.orderedAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {(order.status === 'ORDERED' || order.status === 'PARTIAL') && (
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/purchase-orders/${order.id}/arrivals/new`)}
                        className="text-emerald-600 hover:text-emerald-800 font-medium text-xs px-2 py-1 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        入荷登録
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-4">
            <h3 id="confirm-title" className="text-lg font-semibold text-gray-900 mb-4">発注内容の確認</h3>
            <div className="space-y-2 mb-6 text-sm text-gray-700">
              <p><span className="font-medium">単品:</span> {selectedItem?.name}</p>
              <p><span className="font-medium">数量:</span> {confirmDialog.quantity} 本</p>
              <p><span className="font-medium">仕入先:</span> {selectedItem?.supplierName}</p>
              <p><span className="font-medium">希望納品日:</span> {desiredDeliveryDate}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2.5 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={createMutation.isPending}
                className="flex-1 bg-emerald-600 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                発注確定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
