import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../lib/auth-api'
import { useAuth } from '../../providers/AuthProvider'
import type { RegisterRequest } from '../../types/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>()

  const onSubmit = async (data: RegisterRequest) => {
    try {
      setError(null)
      const response = await authApi.register(data)
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
    <div className="register-page">
      <h2>新規登録</h2>
      {error && <p className="error-message" role="alert">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            {...register('email', { required: 'メールアドレスは必須です' })}
          />
          {errors.email && (
            <span className="field-error">{errors.email.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: 'パスワードは必須です',
              minLength: { value: 8, message: '8文字以上で入力してください' },
            })}
          />
          {errors.password && (
            <span className="field-error">{errors.password.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="firstName">姓</label>
          <input
            id="firstName"
            type="text"
            {...register('firstName', { required: '姓は必須です' })}
          />
          {errors.firstName && (
            <span className="field-error">{errors.firstName.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">名</label>
          <input
            id="lastName"
            type="text"
            {...register('lastName', { required: '名は必須です' })}
          />
          {errors.lastName && (
            <span className="field-error">{errors.lastName.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="phone">電話番号（任意）</label>
          <input id="phone" type="tel" {...register('phone')} />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '登録中...' : '登録'}
        </button>
      </form>
      <p>
        <Link to="/login">ログインはこちら</Link>
      </p>
    </div>
  )
}
