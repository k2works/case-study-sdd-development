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
        if (axiosError.response?.status === 400) {
          setError('メールアドレスまたはパスワードが正しくありません')
        } else if (axiosError.response?.status === 404) {
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
    <div className="login-page">
      <h2>ログイン</h2>
      {error && <p className="error-message" role="alert">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'メールアドレスは必須です',
            })}
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
            })}
          />
          {errors.password && (
            <span className="field-error">{errors.password.message}</span>
          )}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      <p>
        <Link to="/register">新規登録はこちら</Link>
      </p>
    </div>
  )
}
