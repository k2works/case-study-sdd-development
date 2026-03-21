import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { orderApi } from '../../lib/order-api'
import { useAuth } from '../../providers/AuthProvider'
import type { OrderRequest } from '../../types/order'
import type { Product } from '../../types/product'

interface OrderFormData {
  recipientName: string
  postalCode: string
  address: string
  phone: string
  deliveryDate: string
  message: string
}

interface ProblemResponse {
  detail?: string
  errors?: string[]
}

interface ApiErrorLike {
  response?: {
    status?: number
    data?: ProblemResponse
  }
}

function getOrderErrorInfo(error: unknown): { message: string; requiresRelogin: boolean } {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as ApiErrorLike
    const status = apiError.response?.status
    const detail = apiError.response?.data?.detail
    const errors = apiError.response?.data?.errors

    if (status === 404 && typeof detail === 'string' && (detail.includes('ユーザー') || detail.includes('得意先'))) {
      return {
        message: 'ログイン状態が無効になりました。再度ログインしてください。',
        requiresRelogin: true,
      }
    }

    if (Array.isArray(errors) && errors.length > 0) {
      return {
        message: errors[0],
        requiresRelogin: false,
      }
    }

    if (typeof detail === 'string' && detail.trim() !== '') {
      return {
        message: detail,
        requiresRelogin: false,
      }
    }
  }

  return {
    message: '注文の送信に失敗しました。もう一度お試しください。',
    requiresRelogin: false,
  }
}

export function OrderConfirmPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [requiresRelogin, setRequiresRelogin] = useState(false)

  const state = location.state as { product: Product; form: OrderFormData } | null

  const mutation = useMutation({
    mutationFn: (data: OrderRequest) => orderApi.placeOrder(data),
    onSuccess: () => {
      setErrorMessage(null)
      setRequiresRelogin(false)
      navigate('/orders/complete', { replace: true })
    },
    onError: (error) => {
      const { message, requiresRelogin: shouldRelogin } = getOrderErrorInfo(error)
      setErrorMessage(message)
      setRequiresRelogin(shouldRelogin)

      if (shouldRelogin) {
        logout()
      }
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  if (!state) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">注文情報がありません。</p>
        <Link to="/catalog/products" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
          商品一覧に戻る
        </Link>
      </div>
    )
  }

  const { product, form } = state

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`

  const handlePlaceOrder = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setErrorMessage(null)
    setRequiresRelogin(false)

    const request: OrderRequest = {
      productId: product.id,
      deliveryDate: form.deliveryDate,
      recipientName: form.recipientName,
      postalCode: form.postalCode,
      address: form.address,
      ...(form.phone ? { phone: form.phone } : {}),
      ...(form.message ? { message: form.message } : {}),
    }

    mutation.mutate(request)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">注文内容の確認</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">商品情報</h3>
          <p className="text-lg font-semibold text-gray-900">{product.name}</p>
          <p className="text-2xl font-bold text-emerald-600">{formatPrice(product.price)}</p>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">届け先情報</h3>
          <dl className="space-y-2">
            <div className="flex">
              <dt className="w-32 text-sm text-gray-500">届け先氏名</dt>
              <dd className="text-sm text-gray-900">{form.recipientName}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-sm text-gray-500">郵便番号</dt>
              <dd className="text-sm text-gray-900">{form.postalCode}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-sm text-gray-500">住所</dt>
              <dd className="text-sm text-gray-900">{form.address}</dd>
            </div>
            {form.phone && (
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">電話番号</dt>
                <dd className="text-sm text-gray-900">{form.phone}</dd>
              </div>
            )}
            <div className="flex">
              <dt className="w-32 text-sm text-gray-500">配達希望日</dt>
              <dd className="text-sm text-gray-900">{form.deliveryDate}</dd>
            </div>
            {form.message && (
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">メッセージ</dt>
                <dd className="text-sm text-gray-900 whitespace-pre-wrap">{form.message}</dd>
              </div>
            )}
          </dl>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">
            <p className="m-0">{errorMessage}</p>
            {requiresRelogin && (
              <Link to="/login" className="inline-block mt-2 text-sm font-medium text-red-700 underline">
                ログインページへ
              </Link>
            )}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 border border-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm"
          >
            入力画面に戻る
          </button>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            注文を確定する
          </button>
        </div>
      </div>
    </div>
  )
}
