import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { itemApi } from '../../lib/item-api'
import type { Item } from '../../types/item'

export function ItemListPage() {
  const queryClient = useQueryClient()

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await itemApi.findAll()
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => itemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`「${name}」を削除しますか？`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">単品管理</h2>
        <Link
          to="/items/new"
          className="bg-emerald-600 text-white font-medium rounded-lg px-5 py-2.5 hover:bg-emerald-700 shadow-sm transition-all no-underline text-sm"
        >
          新規登録
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500" aria-live="polite">読み込み中...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">登録された単品はありません。</p>
          <Link
            to="/items/new"
            className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            最初の単品を登録する
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <caption className="sr-only">単品一覧</caption>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">商品名</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">品質保持日数</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">発注単位</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">リードタイム</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">仕入先</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.qualityRetentionDays}日</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.purchaseUnit}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.leadTimeDays}日</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.supplierName}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <Link
                      to={`/items/${item.id}/edit`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium mr-4"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      削除
                    </button>
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
