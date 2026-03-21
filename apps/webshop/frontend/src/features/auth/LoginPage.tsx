import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../lib/auth-api'
import { useAuth } from '../../providers/AuthProvider'
import type { LoginRequest } from '../../types/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>()

  const onSubmit = async (data: LoginRequest) => {
    try {
      setError(null)
      const response = await authApi.login(data)
      const { token, email, role, firstName, lastName } = response.data
      login(token, { email, role, firstName, lastName })
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status: number } }
        if (axiosError.response?.status === 400 || axiosError.response?.status === 404) {
          setError('メールアドレスまたはパスワードが正しくありません')
        } else {
          setError('ログインに失敗しました')
        }
      } else {
        setError('ログインに失敗しました')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700">フレール・メモワール</h1>
          <p className="text-gray-500 mt-1">WEB ショップ</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">ログイン</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="email@example.com"
                {...register('email', { required: 'メールアドレスは必須です' })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1" role="alert">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="8文字以上"
                {...register('password', { required: 'パスワードは必須です' })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1" role="alert">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white font-medium rounded-lg px-6 py-3 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          <p className="text-center text-gray-500 mt-6">
            アカウントをお持ちでない方は{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
              新規登録はこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
