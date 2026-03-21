import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { catalogApi } from '../../lib/product-api'
import type { Product } from '../../types/product'

interface OrderFormData {
  recipientName: string
  postalCode: string
  address: string
  phone: string
  deliveryDate: string
  message: string
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMinDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return toLocalDateString(tomorrow)
}

function getMaxDate(): string {
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  return toLocalDateString(maxDate)
}

export function OrderFormPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const numProductId = Number(productId)

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['catalog-products', numProductId],
    queryFn: async () => {
      const res = await catalogApi.findById(numProductId)
      return res.data
    },
  })

  const [form, setForm] = useState<OrderFormData>({
    recipientName: '',
    postalCode: '',
    address: '',
    phone: '',
    deliveryDate: getMinDate(),
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'message' && value.length > 200) return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const isValid =
    form.recipientName.trim() !== '' &&
    form.postalCode.trim() !== '' &&
    form.address.trim() !== '' &&
    form.deliveryDate !== ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !product) return
    navigate('/orders/confirm', {
      state: {
        product,
        form,
      },
    })
  }

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`

  if (isLoading) {
    return <p className="text-gray-500 text-center py-12">読み込み中...</p>
  }

  if (!product) {
    return <p className="text-gray-500 text-center py-12">商品が見つかりません。</p>
  }

  return (
    <div>
      <Link
        to={`/catalog/products/${product.id}`}
        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mb-4 inline-block"
      >
        ← 商品詳細に戻る
      </Link>

      <h2 className="text-2xl font-semibold text-gray-900 mb-6">注文入力</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 max-w-3xl">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">選択した商品</h3>
        <p className="text-lg font-semibold text-gray-900">{product.name}</p>
        <p className="text-2xl font-bold text-emerald-600">{formatPrice(product.price)}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
              届け先氏名 <span className="text-red-500">*</span>
            </label>
            <input
              id="recipientName"
              name="recipientName"
              type="text"
              value={form.recipientName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              郵便番号 <span className="text-red-500">*</span>
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              value={form.postalCode}
              onChange={handleChange}
              required
              placeholder="123-4567"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              住所 <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              電話番号
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
              配達希望日 <span className="text-red-500">*</span>
            </label>
            <input
              id="deliveryDate"
              name="deliveryDate"
              type="date"
              value={form.deliveryDate}
              onChange={handleChange}
              min={getMinDate()}
              max={getMaxDate()}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              メッセージ（最大 200 文字）
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              maxLength={200}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-gray-400 mt-1">{form.message.length} / 200</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-emerald-600 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            確認画面へ
          </button>
        </div>
      </form>
    </div>
  )
}
