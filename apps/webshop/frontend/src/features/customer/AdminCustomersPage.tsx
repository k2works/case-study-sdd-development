import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { customerApi } from '../../lib/customer-api'
import type { CustomerResponse } from '../../types/customer'

export function AdminCustomersPage() {
  const [searchName, setSearchName] = useState('')
  const [queryName, setQueryName] = useState<string | undefined>(undefined)

  const { data: customers = [], isLoading } = useQuery<CustomerResponse[]>({
    queryKey: ['admin-customers', queryName],
    queryFn: () => customerApi.getCustomers(queryName),
  })

  const handleSearch = () => {
    setQueryName(searchName || undefined)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">得意先管理</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-end gap-4">
          <div>
            <label htmlFor="customerSearch" className="block text-sm font-medium text-gray-700 mb-1">
              得意先名
            </label>
            <input
              id="customerSearch"
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="得意先名で検索"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 text-sm hover:bg-emerald-700 transition-colors"
          >
            検索
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">条件に一致する得意先はありません。</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <caption className="sr-only">得意先一覧</caption>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">氏名</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">メールアドレス</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">電話番号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{customer.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/customers/${customer.id}`}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      詳細
                    </Link>
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
