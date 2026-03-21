import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi } from '../../lib/product-api'
import { itemApi } from '../../lib/item-api'
import type { Product, ProductComposition } from '../../types/product'
import type { Item } from '../../types/item'

export function ProductCompositionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const productId = Number(id)

  const [selectedItemId, setSelectedItemId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number>(1)

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['products', productId],
    queryFn: async () => {
      const res = await productApi.findById(productId)
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

  const addMutation = useMutation({
    mutationFn: () =>
      productApi.addComposition(productId, {
        itemId: Number(selectedItemId),
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] })
      setSelectedItemId('')
      setQuantity(1)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => productApi.removeComposition(productId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] })
    },
  })

  const availableItems = items.filter(
    (item) => !product?.compositions?.some((c) => c.itemId === item.id)
  )

  const handleAdd = () => {
    if (selectedItemId !== '' && quantity >= 1) {
      addMutation.mutate()
    }
  }

  const handleRemove = (itemId: number, itemName: string) => {
    if (window.confirm(`「${itemName}」を構成から削除しますか？`)) {
      removeMutation.mutate(itemId)
    }
  }

  if (productLoading) {
    return <p className="text-gray-500 text-center py-12">読み込み中...</p>
  }

  if (!product) {
    return <p className="text-gray-500 text-center py-12">商品が見つかりません。</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          花束構成管理 - {product.name}
        </h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-white text-gray-700 font-medium rounded-lg px-5 py-2.5 border border-gray-300 hover:bg-gray-50 transition-all text-sm"
        >
          商品一覧に戻る
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">現在の構成</h3>
        {product.compositions?.length === 0 ? (
          <p className="text-gray-500">構成が定義されていません。</p>
        ) : (
          <table className="w-full">
            <caption className="sr-only">花束構成一覧</caption>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">花材名</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">数量</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {product.compositions?.map((comp) => (
                <tr key={comp.itemId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{comp.itemName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{comp.quantity}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      onClick={() => handleRemove(comp.itemId, comp.itemName)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">花材を追加</h3>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="item-select" className="block text-sm font-medium text-gray-700 mb-1">
              花材
            </label>
            <select
              id="item-select"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
            >
              <option value="">花材を選択</option>
              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              数量
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={selectedItemId === '' || quantity < 1}
            className="bg-emerald-600 text-white font-medium rounded-lg px-6 py-2.5 hover:bg-emerald-700 shadow-sm transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  )
}
