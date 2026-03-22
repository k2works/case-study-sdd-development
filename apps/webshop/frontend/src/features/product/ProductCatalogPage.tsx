import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { catalogApi } from '../../lib/product-api'
import type { Product } from '../../types/product'

export function ProductCatalogPage() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const res = await catalogApi.findAll()
      return res.data
    },
  })

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">商品一覧</h2>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500" aria-live="polite">読み込み中...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">現在販売中の商品はありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                <span className="text-6xl">🌸</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-emerald-600 mb-3">{formatPrice(product.price)}</p>
                {product.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                )}
                <Link
                  to={`/catalog/products/${product.id}`}
                  className="inline-block w-full text-center bg-emerald-600 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-emerald-700 transition-all text-sm no-underline"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
