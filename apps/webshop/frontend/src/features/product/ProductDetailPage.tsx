import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { catalogApi } from '../../lib/product-api'
import type { Product } from '../../types/product'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const productId = Number(id)

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['catalog-products', productId],
    queryFn: async () => {
      const res = await catalogApi.findById(productId)
      return res.data
    },
  })

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  if (isLoading) {
    return <p className="text-gray-500 text-center py-12">読み込み中...</p>
  }

  if (!product) {
    return <p className="text-gray-500 text-center py-12">商品が見つかりません。</p>
  }

  return (
    <div>
      <Link
        to="/catalog/products"
        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mb-4 inline-block"
      >
        ← 商品一覧に戻る
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h2>
        <p className="text-3xl font-bold text-emerald-600 mb-6">{formatPrice(product.price)}</p>

        {product.description && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">説明</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        {product.compositions && product.compositions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">構成する花材</h3>
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <table className="w-full">
                <caption className="sr-only">構成花材一覧</caption>
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">花材名</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">数量</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {product.compositions.map((comp) => (
                    <tr key={comp.itemId}>
                      <td className="px-6 py-3 text-sm text-gray-900">{comp.itemName}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{comp.quantity}本</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate(`/orders/new/${product.id}`)}
            className="w-full bg-emerald-600 text-white font-medium rounded-lg px-4 py-3 hover:bg-emerald-700 transition-colors text-sm"
          >
            この商品を注文する
          </button>
        </div>
      </div>
    </div>
  )
}
