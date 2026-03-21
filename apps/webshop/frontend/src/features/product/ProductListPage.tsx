import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { productApi } from '../../lib/product-api'
import type { Product } from '../../types/product'

export function ProductListPage() {
  const queryClient = useQueryClient()

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productApi.findAll()
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`「${name}」を削除しますか？`)) {
      deleteMutation.mutate(id)
    }
  }

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">商品管理</h2>
        <Link
          to="/products/new"
          className="bg-emerald-600 text-white font-medium rounded-lg px-5 py-2.5 hover:bg-emerald-700 shadow-sm transition-all no-underline text-sm"
        >
          新規商品を登録
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500" aria-live="polite">読み込み中...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">登録された商品はありません。</p>
          <Link
            to="/products/new"
            className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            最初の商品を登録する
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <caption className="sr-only">商品一覧</caption>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">商品名</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">価格</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">構成花材数</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">状態</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.compositions?.length ?? 0}種</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.active ? '販売中' : '非公開'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium mr-3"
                    >
                      編集
                    </Link>
                    <Link
                      to={`/products/${product.id}/compositions`}
                      className="text-blue-600 hover:text-blue-700 font-medium mr-3"
                    >
                      構成管理
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
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
