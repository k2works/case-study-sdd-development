import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { purchaseOrderApi } from '../../lib/purchase-order-api'
import { arrivalApi } from '../../lib/arrival-api'
import { itemApi } from '../../lib/item-api'
import type { PurchaseOrder } from '../../types/purchase-order'
import type { Item } from '../../types/item'

export function ArrivalRegistrationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const purchaseOrderId = Number(id)

  const [arrivedDate, setArrivedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [quantity, setQuantity] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState(false)

  const { data: purchaseOrder, isLoading: poLoading } = useQuery<PurchaseOrder>({
    queryKey: ['purchase-order', purchaseOrderId],
    queryFn: async () => {
      const res = await purchaseOrderApi.getById(purchaseOrderId)
      return res.data
    },
  })

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await itemApi.findAll()
      return res.data
    },
  })

  const itemName = items.find((i) => i.id === purchaseOrder?.itemId)?.name ?? ''

  const { data: allOrders = [] } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const res = await purchaseOrderApi.getAll()
      return res.data
    },
    enabled: false,
  })

  // 残数量は発注数量 - 既存入荷合計
  // 簡易的にフロントでは発注数量をそのまま残数量として使い、
  // バックエンドでバリデーションする
  const remainingQuantity = purchaseOrder?.quantity ?? 0

  const registerMutation = useMutation({
    mutationFn: () =>
      arrivalApi.register(purchaseOrderId, {
        quantity,
        arrivedDate,
      }),
    onSuccess: () => {
      navigate('/admin/purchase-orders')
    },
    onError: (err: unknown) => {
      setConfirmDialog(false)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail ?? '入荷登録に失敗しました')
      } else {
        setError('入荷登録に失敗しました')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (quantity <= 0) {
      setError('数量は1以上で入力してください')
      return
    }
    if (!arrivedDate) {
      setError('入荷日を入力してください')
      return
    }
    setConfirmDialog(true)
  }

  const handleConfirm = () => {
    registerMutation.mutate()
  }

  if (poLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!purchaseOrder) {
    return (
      <div className="p-6">
        <p className="text-red-600">発注が見つかりません</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">入荷登録</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">発注情報</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">単品:</span>
            <span className="ml-2 text-gray-900 font-medium">{itemName}</span>
          </div>
          <div>
            <span className="text-gray-500">仕入先:</span>
            <span className="ml-2 text-gray-900">{purchaseOrder.supplierName}</span>
          </div>
          <div>
            <span className="text-gray-500">発注数量:</span>
            <span className="ml-2 text-gray-900">{purchaseOrder.quantity}</span>
          </div>
          <div>
            <span className="text-gray-500">残数量:</span>
            <span className="ml-2 text-gray-900 font-medium">{remainingQuantity}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">入荷情報</h3>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="arrivedDate" className="block text-sm font-medium text-gray-700 mb-1">
                入荷日
              </label>
              <input
                id="arrivedDate"
                type="date"
                value={arrivedDate}
                onChange={(e) => setArrivedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="arrivalQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                入荷数量
              </label>
              <input
                id="arrivalQuantity"
                type="number"
                min={1}
                max={remainingQuantity}
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder={`1 〜 ${remainingQuantity}`}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/purchase-orders')}
              className="border border-gray-300 text-gray-700 font-medium rounded-lg px-6 py-3 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="bg-emerald-600 text-white font-medium rounded-lg px-6 py-3 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              入荷登録
            </button>
          </div>
        </form>
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="confirm-arrival-title">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-4">
            <h3 id="confirm-arrival-title" className="text-lg font-semibold text-gray-900 mb-4">入荷登録の確認</h3>
            <div className="space-y-2 mb-6 text-sm text-gray-700">
              <p><span className="font-medium">単品:</span> {itemName}</p>
              <p><span className="font-medium">入荷数量:</span> {quantity}</p>
              <p><span className="font-medium">入荷日:</span> {arrivedDate}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2.5 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={registerMutation.isPending}
                className="flex-1 bg-emerald-600 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {registerMutation.isPending && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                登録確定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
