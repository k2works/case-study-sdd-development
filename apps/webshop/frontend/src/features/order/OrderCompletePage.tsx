import { Link } from 'react-router-dom'

export function OrderCompletePage() {
  return (
    <div className="text-center py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-lg mx-auto">
        <div className="text-emerald-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">ご注文ありがとうございます</h2>
        <p className="text-gray-600 mb-8">
          ご注文を承りました。配達日までに丁寧にお届けいたします。
        </p>
        <Link
          to="/catalog/products"
          className="inline-block bg-emerald-600 text-white font-medium rounded-lg px-6 py-2.5 hover:bg-emerald-700 transition-colors text-sm no-underline"
        >
          商品一覧に戻る
        </Link>
      </div>
    </div>
  )
}
