import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { inventoryApi } from '../../lib/inventory-api'
import { itemApi } from '../../lib/item-api'
import type { Item } from '../../types/item'
import type { DailyInventory } from '../../types/stock'

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function InventoryTransitionPage() {
  const today = new Date()
  const twoWeeksLater = new Date(today)
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 13)

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [fromDate, setFromDate] = useState(formatDate(today))
  const [toDate, setToDate] = useState(formatDate(twoWeeksLater))

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await itemApi.findAll()
      return res.data
    },
  })

  const selectedItem = items.find((i) => i.id === selectedItemId)

  const { data: transition = [], isLoading } = useQuery<DailyInventory[]>({
    queryKey: ['inventory-transition', selectedItemId, fromDate, toDate],
    queryFn: async () => {
      const res = await inventoryApi.getTransition(selectedItemId!, fromDate, toDate)
      return res.data
    },
    enabled: !!selectedItemId,
  })

  const getRowClass = (projected: number) => {
    if (projected <= 0) return 'bg-red-50 text-red-900'
    if (selectedItem && projected < selectedItem.purchaseUnit)
      return 'bg-amber-50 text-amber-900'
    return ''
  }

  const getStatusBadge = (projected: number) => {
    if (projected <= 0)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          欠品
        </span>
      )
    if (selectedItem && projected < selectedItem.purchaseUnit)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          要発注
        </span>
      )
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        正常
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">在庫推移</h2>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-amber-800">
        入荷予定・受注引当は現在未反映です。在庫予定は現在庫と廃棄予定のみで計算されています。
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="itemSelect" className="block text-sm font-medium text-gray-700 mb-1">
              単品
            </label>
            <select
              id="itemSelect"
              value={selectedItemId ?? ''}
              onChange={(e) => setSelectedItemId(e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">単品を選択してください</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        {selectedItem && (
          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <span>仕入先: {selectedItem.supplierName}</span>
            <span>購入単位: {selectedItem.purchaseUnit}</span>
            <span>リードタイム: {selectedItem.leadTimeDays}日</span>
            <span>品質保持: {selectedItem.qualityRetentionDays}日</span>
          </div>
        )}
      </div>

      {!selectedItemId ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">単品を選択して在庫推移を表示します。</p>
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">在庫推移テーブル</h3>
            <Link
              to={`/admin/purchase-orders?itemId=${selectedItemId}`}
              className="bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-emerald-700 shadow-sm transition-all no-underline text-sm"
            >
              発注する
            </Link>
          </div>
          <table className="w-full">
            <caption className="sr-only">在庫推移テーブル</caption>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">日付</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">前日在庫</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">入荷予定</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">受注引当</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">廃棄予定</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">在庫予定</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transition.map((day) => (
                <tr key={day.date} className={`${getRowClass(day.projectedStock)} transition-colors`}>
                  <td className="px-4 py-3 text-sm font-medium">{day.date}</td>
                  <td className="px-4 py-3 text-sm text-right">{day.previousStock}</td>
                  <td className="px-4 py-3 text-sm text-right text-emerald-600 font-medium">
                    {day.expectedArrivals > 0 ? `+${day.expectedArrivals}` : '0'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600">
                    {day.orderAllocations > 0 ? `-${day.orderAllocations}` : '0'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">
                    {day.expectedExpirations > 0 ? `-${day.expectedExpirations}` : '0'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold">{day.projectedStock}</td>
                  <td className="px-4 py-3 text-sm text-center">{getStatusBadge(day.projectedStock)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
