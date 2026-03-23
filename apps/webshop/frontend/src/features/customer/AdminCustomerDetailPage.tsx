import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { customerApi } from '../../lib/customer-api'
import type { CustomerDetailResponse } from '../../types/customer'

export function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const customerId = Number(id)

  const { data: customer, isLoading } = useQuery<CustomerDetailResponse>({
    queryKey: ['admin-customers', customerId],
    queryFn: () => customerApi.getCustomerDetail(customerId),
  })

  if (isLoading) {
    return <p className="text-gray-500 text-center py-12">読み込み中...</p>
  }

  if (!customer) {
    return <p className="text-gray-500 text-center py-12">得意先が見つかりません。</p>
  }

  return (
    <div>
      <Link
        to="/admin/customers"
        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mb-4 inline-block"
      >
        ← 得意先一覧に戻る
      </Link>

      <h2 className="text-2xl font-semibold text-gray-900 mb-6">得意先詳細</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">基本情報</h3>
        <dl className="space-y-3">
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">氏名</dt>
            <dd className="text-sm text-gray-900">{customer.name}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">メールアドレス</dt>
            <dd className="text-sm text-gray-900">{customer.email}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">電話番号</dt>
            <dd className="text-sm text-gray-900">{customer.phone ?? '—'}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-sm text-gray-500">登録日</dt>
            <dd className="text-sm text-gray-900">{customer.createdAt}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">注文履歴</h3>
        {customer.orders.length === 0 ? (
          <p className="text-gray-500">まだ注文履歴がありません。</p>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">注文履歴</caption>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">受注番号</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">商品名</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">届け日</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ステータス</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">注文日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customer.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.deliveryDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.status}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.orderedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
