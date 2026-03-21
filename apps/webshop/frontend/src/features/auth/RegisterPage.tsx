import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../lib/auth-api'
import { useAuth } from '../../providers/AuthProvider'
import type { RegisterRequest } from '../../types/auth'

interface RegisterFormData extends RegisterRequest {
  passwordConfirm: string
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>()

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordConfirm: _, ...requestData } = data
      const response = await authApi.register(requestData)
      const { token, email, role, firstName, lastName } = response.data
      login(token, { email, role, firstName, lastName })
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status: number } }
        if (axiosError.response?.status === 400) {
          setError('入力内容に問題があります')
        } else if (axiosError.response?.status === 409) {
          setError('このメールアドレスは既に登録されています')
        } else {
          setError('登録に失敗しました')
        }
      } else {
        setError('登録に失敗しました')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700">フレール・メモワール</h1>
          <p className="text-gray-500 mt-1">WEB ショップ</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">新規登録</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input id="email" type="email" className={inputClass} placeholder="email@example.com"
                aria-required="true"
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
              <input id="password" type="password" className={inputClass} placeholder="8文字以上"
                aria-required="true"
                {...register('password', {
                  required: 'パスワードは必須です',
                  minLength: { value: 8, message: '8文字以上で入力してください' },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1" role="alert">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認）
              </label>
              <input id="passwordConfirm" type="password" className={inputClass} placeholder="もう一度入力"
                aria-required="true"
                {...register('passwordConfirm', {
                  required: 'パスワード（確認）は必須です',
                  validate: (value) => value === watch('password') || 'パスワードが一致しません',
                })}
              />
              {errors.passwordConfirm && (
                <p className="text-red-500 text-sm mt-1" role="alert">{errors.passwordConfirm.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  姓
                </label>
                <input id="lastName" type="text" className={inputClass} placeholder="山田"
                  aria-required="true"
                  {...register('lastName', { required: '姓は必須です' })}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1" role="alert">{errors.lastName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  名
                </label>
                <input id="firstName" type="text" className={inputClass} placeholder="太郎"
                  aria-required="true"
                  {...register('firstName', { required: '名は必須です' })}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1" role="alert">{errors.firstName.message}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                電話番号（任意）
              </label>
              <input id="phone" type="tel" className={inputClass} placeholder="090-1234-5678"
                {...register('phone')}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white font-medium rounded-lg px-6 py-3 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '登録中...' : '登録'}
            </button>
          </form>
          <p className="text-center text-gray-500 mt-6">
            既にアカウントをお持ちの方は{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              ログインはこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
